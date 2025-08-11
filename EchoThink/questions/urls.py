from django.urls import path
from . import views

urlpatterns = [
    path("criar-pergunta/", views.criar_pergunta, name="criar_pergunta"),
    path("listar-perguntas/", views.listar_perguntas, name="listar_perguntas"),
    path("deletar-pergunta/<int:pk>/", views.deletar_pergunta, name="deletar_pergunta"),

]
