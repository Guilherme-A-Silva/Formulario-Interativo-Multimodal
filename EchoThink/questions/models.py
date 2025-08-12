from django.db import models
from django.contrib.auth.models import User

class Question(models.Model):
    title = models.CharField(max_length=255)
    question = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to="perguntas/imagens/", null=True, blank=True)
    audio = models.FileField(upload_to="perguntas/audios/", null=True, blank=True)
    is_relevant = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title

    def to_dict(self):
        """Retorna no formato que o frontend espera"""
        return {
            "id": self.id,
            "title": self.title,
            "question": self.question,
            "image": self.image.url if self.image else None,
            "audio": self.audio.url if self.audio else None,
            "options": [opt.text for opt in self.options.all()],
        }


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.question.title} - {self.text}"

class UserResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    resposta_texto = models.TextField(blank=True, null=True)
    resposta_opcao = models.CharField(max_length=255, blank=True, null=True)
    tempo_resposta = models.FloatField(blank=True, null=True)  # segundos
    data_resposta = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.question.texto}"