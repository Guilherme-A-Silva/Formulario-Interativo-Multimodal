from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .serializers import RegisterSerializer, UserProfileListSerializer
from .models import UserProfile
from .utils.token_reset import gerar_token_reset
from .utils.token_reset import validar_token_reset
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny

# ------------------ Registro ------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]
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


# ------------------ Login ------------------
class LoginView(APIView):
    permission_classes = [AllowAny]
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

# ------------------ Logout ------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # apenas usuários logados

    def post(self, request):
        logout(request)
        return Response({"mensagem": "Logout realizado com sucesso"}, status=status.HTTP_200_OK)
    
# ------------------ CSRF ------------------
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    def get(self, request):
        return Response({'message': 'CSRF token definido'})


# ------------------ Listar Participantes ------------------
@api_view(['GET'])
def listar_participantes(request):
    participantes = UserProfile.objects.all()
    serializer = UserProfileListSerializer(participantes, many=True)
    return Response(serializer.data)


# ------------------ Solicitar Redefinição de Senha ------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def solicitar_redefinicao(request):
    """
    Solicita redefinição de senha enviando um link temporário por e-mail.
    """
    email = request.data.get("email")
    if not email:
        return Response({"erro": "Email é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Sempre responde igual para evitar exposição de dados
        return Response(
            {"mensagem": "Se este email existir, você receberá instruções."},
            status=status.HTTP_200_OK
        )

    # Gera token temporário (com expiração definida no util)
    token = gerar_token_reset(user.username)

    # Link para frontend
    link = f"https://frontend-production-78a1.up.railway.app/redefinir-senha/?token={token}"

    assunto = "🔑 Redefinição de senha - EchoThink"
    mensagem = (
        f"Olá, {user.username}!\n\n"
        "Recebemos uma solicitação para redefinir sua senha.\n"
        f"Acesse o link abaixo para continuar (válido por 30 minutos):\n\n"
        f"{link}\n\n"
        "Se você não solicitou, ignore este email."
    )

    try:
        send_mail(
            subject=assunto,
            message=mensagem,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response(
            {"mensagem": "Se este email existir, você receberá instruções."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"erro": f"Falha no envio do email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# ------------------ Redefinir Senha ------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def redefinir_senha(request):
    token = request.data.get("token")
    nova_senha = request.data.get("nova_senha")

    if not token or not nova_senha:
        return Response(
            {"erro": "Token e nova senha são obrigatórios"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Valida o token
    resultado = validar_token_reset(token)
    if not resultado["valido"]:
        return Response(
            {"erro": "Token inválido ou expirado", "detalhes": resultado.get("erro")},
            status=status.HTTP_400_BAD_REQUEST
        )

    username = resultado["dados"]["username"]

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"erro": "Usuário não encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Atualiza a senha
    user.set_password(nova_senha)
    user.save()

    return Response(
        {"mensagem": "Senha redefinida com sucesso"},
        status=status.HTTP_200_OK
    )