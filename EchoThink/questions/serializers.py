from rest_framework import serializers
from .models import Question, Option

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["text"]

class QuestionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    audio = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "title", "question", "image", "audio", "options"]

    def get_image(self, obj):
        return obj.image.url if obj.image else None

    def get_audio(self, obj):
        return obj.audio.url if obj.audio else None

    def get_options(self, obj):
        return [opt.text for opt in obj.options.all()]
