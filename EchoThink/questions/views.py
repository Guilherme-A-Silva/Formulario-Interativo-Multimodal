from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import Question, Option, UserResponse
from .serializers import QuestionSerializer, UserResponseSerializer, MultipleUserResponsesSerializer
from django.http import HttpResponse
import pandas as pd
from io import BytesIO


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def criar_pergunta(request):
    """
    Exemplo de requisição via POST (multipart/form-data):

    title: Pergunta 1
    question: Qual dessas alternativas você prefere?
    image: [arquivo.jpg] (opcional)
    audio: [arquivo.mp3] (opcional)
    options: Alternativa 1
    options: Alternativa 2
    options: Alternativa 3
    """
    title = request.data.get("title")
    question = request.data.get("question")
    image = request.FILES.get("image")
    audio = request.FILES.get("audio")
    options = request.data.getlist("options")

    if not title or not options:
        return Response({"error": "Título e opções são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

    q = Question.objects.create(title=title, question=question, image=image, audio=audio)

    for opt in options:
        Option.objects.create(question=q, text=opt)

    return Response({"message": "Pergunta criada com sucesso!", "id": q.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def listar_perguntas(request):
    perguntas = Question.objects.all()
    serializer = QuestionSerializer(perguntas, many=True, context={"request": request})
    return Response(serializer.data, status=200)

@api_view(["DELETE"])
def deletar_pergunta(request, pk):
    try:
        pergunta = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({"error": "Pergunta não encontrada."}, status=404)

    pergunta.delete()
    return Response({"message": "Pergunta excluída com sucesso."}, status=204)

@api_view(["PATCH"])
def marcar_relevante(request, pk):
    try:
        pergunta = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({"erro": "Pergunta não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    is_relevant = request.data.get("is_relevant")
    if is_relevant is None:
        return Response({"erro": "Campo 'is_relevant' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    pergunta.is_relevant = bool(is_relevant)
    pergunta.save()

    return Response({"mensagem": "Relevância atualizada com sucesso"})

def gerar_relatorio_respostas_pivotado(request, formato):
    respostas = UserResponse.objects.filter(question__is_relevant=True).values(
        "user__username",
        "question__id",
        "question__title",
        "question__audio",
        "resposta_texto",
        "resposta_opcao",
        "tempo_resposta",
        "data_resposta",
    )

    if not respostas.exists():
        return HttpResponse("Nenhuma resposta relevante encontrada", status=404)

    df = pd.DataFrame(list(respostas))

    # -----------------------------
    # Normalizações para evitar 500
    # -----------------------------

    # data_resposta -> naive (Excel não gosta de timezone-aware)
    if "data_resposta" in df.columns:
        df["data_resposta"] = pd.to_datetime(df["data_resposta"], errors="coerce")
        # Se vier timezone-aware, remove timezone; se vier naive, mantém
        try:
            df["data_resposta"] = df["data_resposta"].dt.tz_localize(None)
        except TypeError:
            pass

    # resposta_final: usa opção se existir, senão texto (e garante string)
    df["resposta_opcao"] = df.get("resposta_opcao")
    df["resposta_texto"] = df.get("resposta_texto")

    df["resposta_final"] = df["resposta_opcao"].combine_first(df["resposta_texto"])

    # tempo_resposta -> numérico (pra formatar depois)
    if "tempo_resposta" in df.columns:
        df["tempo_resposta"] = pd.to_numeric(df["tempo_resposta"], errors="coerce")

    # Coluna "titulo_final" para pivot (evita nulo/vazio e evita duplicação)
    # 1) usa title se tiver
    # 2) se não tiver, usa nome do arquivo de áudio (sem path)
    # 3) se não tiver, usa "Q{id}"
    def _titulo_final(row):
        title = (row.get("question__title") or "").strip()
        if title:
            return title

        audio = (row.get("question__audio") or "").strip()
        if audio:
            # pega só o nome do arquivo
            return audio.split("/")[-1]

        qid = row.get("question__id")
        return f"Q{qid}" if qid is not None else "Pergunta"

    df["titulo_final"] = df.apply(_titulo_final, axis=1)

    # Se ainda assim existir duplicidade de titulo_final (muito comum),
    # adiciona o id da pergunta no final para garantir colunas únicas.
    # Ex: "AS20.wav (101)"
    df["titulo_final"] = df["titulo_final"] + " (" + df["question__id"].astype(str) + ")"

    # -----------------------------
    # Pivots (usa pivot_table para não quebrar com duplicados)
    # -----------------------------

    df_pivot_resp = df.pivot_table(
        index="user__username",
        columns="titulo_final",
        values="resposta_final",
        aggfunc="first",   # pega a primeira resposta se houver duplicidade
    )
    df_pivot_resp.columns = [f"Resposta - {col}" for col in df_pivot_resp.columns]

    df_pivot_tempo = df.pivot_table(
        index="user__username",
        columns="titulo_final",
        values="tempo_resposta",
        aggfunc="first",
    )

    # Formata tempos para 8 casas decimais (sem estourar com NaN)
    df_pivot_tempo = df_pivot_tempo.applymap(
        lambda x: f"{float(x):.8f}" if pd.notnull(x) else ""
    )
    df_pivot_tempo.columns = [f"Tempo (s) - {col}" for col in df_pivot_tempo.columns]

    df_final = pd.concat([df_pivot_resp, df_pivot_tempo], axis=1).reset_index()
    df_final.rename(columns={"user__username": "usuario"}, inplace=True)

    # -----------------------------
    # Export
    # -----------------------------

    if formato == "csv":
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas_pivotado.csv"'
        df_final.to_csv(path_or_buf=response, index=False)
        return response

    elif formato == "excel":
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df_final.to_excel(writer, index=False, sheet_name="Relatorio")

        output.seek(0)
        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas_pivotado.xlsx"'
        return response

    else:
        return HttpResponse("Formato inválido. Use 'csv' ou 'excel'.", status=400)

@api_view(["POST"])
def registrar_resposta(request):
    serializer = UserResponseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Resposta registrada com sucesso"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def registrar_varias_respostas(request):
    user = request.user
    respostas = request.data.get("respostas", [])

    # Pega os IDs das perguntas enviadas
    question_ids = [r.get("question") for r in respostas if r.get("question") is not None]

    # Verifica se já existem respostas do usuário para essas perguntas
    respostas_existentes = UserResponse.objects.filter(user=user, question_id__in=question_ids)

    if respostas_existentes.exists():
        return Response(
            {"error": "Você já enviou respostas para essas perguntas."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Adiciona o usuário nos dados das respostas
    for resposta in respostas:
        resposta["user"] = user.id

        # Força tempo_resposta com até 8 casas decimais
        if "tempo_resposta" in resposta and resposta["tempo_resposta"] is not None:
            resposta["tempo_resposta"] = float(f"{float(resposta['tempo_resposta']):.8f}")

    # Cria o serializer e salva todas as respostas
    serializer = MultipleUserResponsesSerializer(data={"respostas": respostas})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Todas as respostas foram registradas com sucesso"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)