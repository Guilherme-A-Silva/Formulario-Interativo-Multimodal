from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Option
from .serializers import QuestionSerializer

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
    return Response(serializer.data)

@api_view(["DELETE"])
def deletar_pergunta(request, pk):
    try:
        pergunta = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({"error": "Pergunta não encontrada."}, status=404)

    pergunta.delete()
    return Response({"message": "Pergunta excluída com sucesso."}, status=204)
