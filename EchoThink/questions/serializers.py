from rest_framework import serializers
from .models import Question, Option

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
        fields = ["id", "title", "question", "image_url", "audio_url", "options"]

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
