import base64
from rest_framework import serializers
from .models import Question, Option, UserResponse
from decimal import Decimal, getcontext


getcontext().prec = 10  # garante precisão suficiente


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "question",
            "image_url",
            "audio_url",
            "options",
            "is_relevant",
        ]

    def get_image_url(self, obj):
        """
        Prioridade:
        1) banco (image_bytes)
        2) filesystem (image.url)
        """
        request = self.context.get("request")

        # 1️⃣ banco
        if getattr(obj, "image_bytes", None) and getattr(obj, "image_mime", None):
            b64 = base64.b64encode(obj.image_bytes).decode("utf-8")
            return f"data:{obj.image_mime};base64,{b64}"

        # 2️⃣ filesystem
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        return None

    def get_audio_url(self, obj):
        """
        Prioridade:
        1) banco (audio_bytes)
        2) filesystem (audio.url)
        """
        request = self.context.get("request")

        # 1️⃣ banco
        if getattr(obj, "audio_bytes", None) and getattr(obj, "audio_mime", None):
            b64 = base64.b64encode(obj.audio_bytes).decode("utf-8")
            return f"data:{obj.audio_mime};base64,{b64}"

        # 2️⃣ filesystem
        if obj.audio and request:
            return request.build_absolute_uri(obj.audio.url)

        return None
    
class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResponse
        fields = ["user", "question", "resposta_texto", "resposta_opcao", "tempo_resposta", "data_resposta"]
        
class MultipleUserResponsesSerializer(serializers.Serializer):
    respostas = UserResponseSerializer(many=True)

    def create(self, validated_data):
        respostas_data = validated_data.pop("respostas")
        respostas_objs = []

        for item in respostas_data:
            # tempo_resposta já foi formatado na view
            respostas_objs.append(UserResponse(**item))

        return UserResponse.objects.bulk_create(respostas_objs)
