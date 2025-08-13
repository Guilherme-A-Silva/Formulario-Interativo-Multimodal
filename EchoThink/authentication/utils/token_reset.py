from itsdangerous import URLSafeTimedSerializer
from django.conf import settings


# Serializer para criar e validar tokens seguros
def _get_serializer():
    return URLSafeTimedSerializer(settings.SECRET_KEY)


def gerar_token_reset(username: str) -> str:
    """
    Gera um token seguro contendo o username.
    """
    s = _get_serializer()
    return s.dumps({"username": username})


def validar_token_reset(token: str, max_age: int = 1800) -> dict:
    """
    Valida um token e retorna o conteúdo.
    max_age em segundos (padrão: 30 minutos).
    """
    s = _get_serializer()
    try:
        data = s.loads(token, max_age=max_age)
        return {"valido": True, "dados": data}
    except Exception as e:
        return {"valido": False, "erro": str(e)}
