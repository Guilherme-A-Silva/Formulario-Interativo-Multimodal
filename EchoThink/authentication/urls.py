# urls.py

from django.urls import path
from .views import LogoutView, redefinir_senha, solicitar_redefinicao, RegisterView, LoginView, CSRFTokenView, listar_participantes

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("csrf/", CSRFTokenView.as_view()),
    path('listar-participantes/', listar_participantes, name='listar-participantes'),
    path('solicitar-redefinicao/', solicitar_redefinicao, name='solicitar-redefinicao'),
    path('redefinir-senha/', redefinir_senha, name='redefinir-senha'),
]
