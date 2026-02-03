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

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def criar_pergunta(request):
    title = (request.data.get("title") or "").strip()
    question = request.data.get("question")

    image_file = request.FILES.get("image")
    audio_file = request.FILES.get("audio")

    options = request.data.getlist("options")

    if not options or len([o for o in options if str(o).strip()]) == 0:
        return Response(
            {"error": "Opções são obrigatórias."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # =========================
    # 1) Leia os bytes ANTES
    # =========================
    image_raw = None
    image_mime = None
    image_name = None

    if image_file:
        try:
            image_raw = image_file.read()
            image_mime = getattr(image_file, "content_type", None) or "image/*"
            image_name = getattr(image_file, "name", "image")
        except Exception:
            image_raw = None
            image_mime = None
            image_name = None

    audio_raw = None
    audio_mime = None
    audio_name = None

    if audio_file:
        try:
            audio_raw = audio_file.read()
            audio_mime = getattr(audio_file, "content_type", None) or "audio/*"
            audio_name = getattr(audio_file, "name", "audio")
        except Exception:
            audio_raw = None
            audio_mime = None
            audio_name = None

    # =========================
    # 2) Cria sem anexar arquivo direto (pra não consumir stream)
    # =========================
    q = Question.objects.create(
        title=title,
        question=question,
        image=None,
        audio=None,
    )

    # =========================
    # 3) Salva bytes + mime no banco
    # =========================
    if image_raw:
        q.image_bytes = image_raw
        q.image_mime = image_mime

    if audio_raw:
        q.audio_bytes = audio_raw
        q.audio_mime = audio_mime

    # =========================
    # 4) (Legado) Salva também no FileField usando ContentFile
    #    (assim não depende do stream original)
    # =========================
    if image_raw and image_name:
        q.image.save(image_name, ContentFile(image_raw), save=False)

    if audio_raw and audio_name:
        q.audio.save(audio_name, ContentFile(audio_raw), save=False)

    q.save()

    for opt in options:
        opt = str(opt).strip()
        if opt:
            Option.objects.create(question=q, text=opt)

    return Response(
        {"message": "Pergunta criada com sucesso!", "id": q.id},
        status=status.HTTP_201_CREATED
    )

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
        "data_resposta"
    )

    if not respostas.exists():
        return HttpResponse("Nenhuma resposta relevante encontrada", status=404)

    df = pd.DataFrame(list(respostas))

    # Converter datetime com timezone para naive, para evitar erro no Excel
    if "data_resposta" in df.columns:
        df["data_resposta"] = pd.to_datetime(df["data_resposta"]).dt.tz_localize(None)

    # resposta final
    df["resposta_final"] = df["resposta_opcao"].combine_first(df["resposta_texto"])

    # ---------
    # NOME EXIBIDO DA PERGUNTA (sem mudar o banco)
    # title pode ficar em branco, mas no relatório sempre terá um label único.
    # ---------
    def build_label(row):
        title = row.get("question__title")
        qid = row.get("question__id")

        # normaliza title vazio
        if title is not None:
            title = str(title).strip()
        if title:
            return title  # mantém título como está

        audio = row.get("question__audio")
        if audio:
            audio_name = str(audio).split("/")[-1]  # só nome do arquivo
            return f"{audio_name} ({qid})"

        return f"Pergunta {qid}"

    df["question_label"] = df.apply(build_label, axis=1)

    # Pivot respostas
    df_pivot_resp = df.pivot(index="user__username", columns="question_label", values="resposta_final")
    df_pivot_resp.columns = [f"Resposta - {col}" for col in df_pivot_resp.columns]

    # Pivot tempo
    df_pivot_tempo = df.pivot(index="user__username", columns="question_label", values="tempo_resposta")
    df_pivot_tempo = df_pivot_tempo.applymap(lambda x: f"{x:.8f}" if pd.notnull(x) else "")
    df_pivot_tempo.columns = [f"Tempo (s) - {col}" for col in df_pivot_tempo.columns]

    # Junta
    df_final = pd.concat([df_pivot_resp, df_pivot_tempo], axis=1).reset_index()
    df_final.rename(columns={"user__username": "usuario"}, inplace=True)

    if formato == "csv":
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas_pivotado.csv"'
        df_final.to_csv(path_or_buf=response, index=False)
        return response

    elif formato == "excel":
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas_pivotado.xlsx"'
        df_final.to_excel(response, index=False, engine="openpyxl")
        return response

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