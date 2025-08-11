from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    nome = serializers.CharField()
    telefone = serializers.CharField()
    endereco = serializers.CharField()
    idade = serializers.IntegerField()
    genero = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'nome', 'telefone', 'endereco', 'idade', 'genero']

    def create(self, validated_data):
        # Extrai dados do perfil
        nome = validated_data.pop('nome')
        telefone = validated_data.pop('telefone')
        endereco = validated_data.pop('endereco')
        idade = validated_data.pop('idade')
        genero = validated_data.pop('genero')

        # Criptografa a senha manualmente
        password = validated_data.pop('password')
        hashed_password = make_password(password)

        user = User.objects.create(
            password=hashed_password,
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            nome=nome,
            telefone=telefone,
            endereco=endereco,
            idade=idade,
            genero=genero
        )

        return user

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileListSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'nome', 'telefone', 'endereco', 'idade', 'genero', 'tipo']