from django.urls import path
from . import views

urlpatterns = [
    path("criar-pergunta/", views.criar_pergunta, name="criar_pergunta"),
    path("listar-perguntas/", views.listar_perguntas, name="listar_perguntas"),
    path("deletar-pergunta/<int:pk>/", views.deletar_pergunta, name="deletar_pergunta"),
    path('marcar-relevante/<int:pk>/', views.marcar_relevante, name='marcar-relevante'),
    path('relatorio-respostas/<str:formato>/', views.gerar_relatorio_respostas, name='gerar-relatorio-respostas'),
     path("responder-multiplo/", views.registrar_varias_respostas, name="registrar-varias-respostas"),
]
