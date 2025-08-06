# urls.py

from django.urls import path
from .views import RegisterView, LoginView, CSRFTokenView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path("csrf/", CSRFTokenView.as_view()),
]
