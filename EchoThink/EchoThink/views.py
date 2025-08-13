from django.http import JsonResponse
from django.views import View
from django.http import HttpResponse
import time, base64, json
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.views import APIView
from django.middleware.csrf import get_token
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny

def hello(request):
    return JsonResponse({"message": "Olá do Django!"})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [AllowAny]  # <-- permite acesso sem login

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})

# Verificar se o usuário está logado
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })

class ValidateTokenView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            token_value = data.get('token')

            if not token_value:
                return JsonResponse({'error': 'Token is required.'}, status=400)

            try:
                decoded_data = base64.urlsafe_b64decode(token_value).decode()
                UserProfile_id, timestamp, _ = decoded_data.split(':')
                UserProfile = UserProfile.objects.filter(id=UserProfile_id).first()

                if not UserProfile:
                    return JsonResponse({'error': 'Invalid token.'}, status=401)
                
                if int(time.time()) - int(timestamp) > 3600:
                    return JsonResponse({'error': 'Token has expired.'}, status=401)

                return JsonResponse({'message': 'Token is valid.', 'token': token_value, 'valid': 1}, status=200)

            except Exception as e:
                return JsonResponse({'error': 'Invalid token format.'}, status=400)

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'error': 'Internal Server Error'}, status=500)