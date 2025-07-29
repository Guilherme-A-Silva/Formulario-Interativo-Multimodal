# 📝 Formulário Interativo Multimodal

Um sistema completo de coleta de dados para pesquisas acadêmicas (como PHDs), com suporte a **respostas em texto, áudio e imagem**.

Construído com:
- ⚛️ React + Vite (frontend)
- 🐍 Django (backend)

---

## 📦 Tecnologias

- **Frontend**
  - React
  - Vite
  - TailwindCSS (opcional)
  - Axios (para comunicação com a API)
  - React Hook Form (para gerenciamento do formulário)

- **Backend**
  - Django
  - Django REST Framework
  - PostgreSQL ou SQLite
  - Django CORS Headers (para integração com o frontend)
  - Pillow (para imagens)
  - Django-Storages (se usar upload para nuvem)

---

## 🧩 Funcionalidades

- [x] Campos de texto tradicionais
- [x] Gravação e upload de áudio diretamente pelo navegador
- [x] Upload de imagens
- [x] Validação de campos obrigatórios
- [x] API RESTful com Django
- [x] Interface responsiva e leve com Vite

---

## 🚀 Como executar

### 1. Backend (Django)

```
# Clone o repositório
git clone https://github.com/seu-usuario/formulario-interativo.git
cd formulario-interativo/backend

# Crie um ambiente virtual
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações
python manage.py migrate

# Inicie o servidor
python manage.py runserver

``` 
### Frontend (React + Vite)

``` 
# Acesse o diretório do frontend
cd formulario-interativo/frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

