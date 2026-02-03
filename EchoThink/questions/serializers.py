import os
import base64
from rest_framework import serializers
from .models import Question, Option, UserResponse
from decimal import Decimal, getcontext


getcontext().prec = 10  # garante precisão suficiente


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    # ✅ novos campos: nomes reais
    image_filename = serializers.SerializerMethodField()
    audio_filename = serializers.SerializerMethodField()

    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "question",
            "image_url",
            "audio_url",
            "image_filename",
            "audio_filename",
            "options",
            "is_relevant",
        ]

    def get_image_filename(self, obj):
        # se você salvou no FileField, dá pra pegar o nome real daqui
        if obj.image and getattr(obj.image, "name", None):
            return os.path.basename(obj.image.name)
        return None

    def get_audio_filename(self, obj):
        if obj.audio and getattr(obj.audio, "name", None):
            return os.path.basename(obj.audio.name)
        return None

    def get_image_url(self, obj):
        request = self.context.get("request")

        # 1) banco
        if getattr(obj, "image_bytes", None) and getattr(obj, "image_mime", None):
            b64 = base64.b64encode(obj.image_bytes).decode("utf-8")
            return f"data:{obj.image_mime};base64,{b64}"

        # 2) filesystem
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        return None

    def get_audio_url(self, obj):
        request = self.context.get("request")

        # 1) banco
        if getattr(obj, "audio_bytes", None) and getattr(obj, "audio_mime", None):
            b64 = base64.b64encode(obj.audio_bytes).decode("utf-8")
            return f"data:{obj.audio_mime};base64,{b64}"

        # 2) filesystem
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
