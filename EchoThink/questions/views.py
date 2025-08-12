from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Option, UserResponse
from .serializers import QuestionSerializer, UserResponseSerializer, MultipleUserResponsesSerializer
from django.http import HttpResponse
import pandas as pd

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

def gerar_relatorio_respostas(request, formato):
    # Filtra apenas respostas de perguntas marcadas como relevantes
    respostas = UserResponse.objects.filter(question__is_relevant=True).values(
        "user__username",
        "question__texto",
        "resposta_texto",
        "resposta_opcao",
        "tempo_resposta",
        "data_resposta"
    )

    if not respostas.exists():
        return HttpResponse("Nenhuma resposta relevante encontrada", status=404)

    df = pd.DataFrame(list(respostas))

    if formato == "csv":
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas.csv"'
        df.to_csv(path_or_buf=response, index=False)
        return response

    elif formato == "excel":
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="relatorio_respostas.xlsx"'
        df.to_excel(response, index=False, engine="openpyxl")
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
def registrar_varias_respostas(request):
    serializer = MultipleUserResponsesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Todas as respostas foram registradas com sucesso"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)