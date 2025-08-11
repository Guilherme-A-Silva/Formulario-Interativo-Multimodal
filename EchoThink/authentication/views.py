from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings

from .serializers import RegisterSerializer, UserProfileListSerializer  # Importe seu serializer de participantes aqui
from .models import UserProfile

# Registro do usuário
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"erro": "Dados inválidos", "detalhes": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        login(request, user)

        email_status = self._enviar_email_boas_vindas(user)

        return Response({
            "mensagem": "Registro realizado com sucesso!",
            "usuario": user.username,
            "email": user.email,
            "status_email": email_status
        }, status=status.HTTP_201_CREATED)

    def _enviar_email_boas_vindas(self, user):
        assunto = "🎉 Bem-vindo ao EchoThink!"
        mensagem = (
            f"Olá, {user.username}!\n\n"
            "Seja bem-vindo(a) à plataforma EchoThink. "
            "Estamos muito felizes em tê-lo(a) conosco.\n\n"
            "Explore, aprenda e evolua com a gente!\n\n"
            "Atenciosamente,\nEquipe EchoThink"
        )
        try:
            send_mail(
                subject=assunto,
                message=mensagem,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return "enviado com sucesso"
        except Exception as e:
            return f"falha no envio: {str(e)}"

# Login baseado em sessão (SessionAuthentication)
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response({
                'message': 'Login bem-sucedido',
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# Define o cookie de CSRF para que o frontend possa usá-lo
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    def get(self, request):
        return Response({'message': 'CSRF token definido'})

# View para listar participantes
@api_view(['GET'])
def listar_participantes(request):
    participantes = UserProfile.objects.all()
    serializer = UserProfileListSerializer(participantes, many=True)
    return Response(serializer.data)
