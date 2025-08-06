from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from django.utils.decorators import method_decorator

# Registro do usuário
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                'message': 'Usuário criado com sucesso!',
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login baseado em sessão (SessionAuthentication)
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            login(request, user)  # Cria a sessão no backend
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
