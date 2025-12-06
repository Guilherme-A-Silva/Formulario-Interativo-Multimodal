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
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "title", "question", "image_url", "audio_url", "options", "is_relevant"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_audio_url(self, obj):
        request = self.context.get("request")
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
