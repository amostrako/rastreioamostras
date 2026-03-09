from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/login")
def login(data: LoginRequest):

    auth = requests.post(
        "https://protheus.quatroktextil.com.br:6632/rest05/api/oauth2/v1/token",
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={
            "grant_type": "password",
            "username": data.username,
            "password": data.password
        },
        verify=False
    )

    if auth.status_code not in [200, 201]:
        print(auth.text)
        return {"error": "Login inválido"}

    token = auth.json()["access_token"]

    sellers = requests.get(
        "https://protheus.quatroktextil.com.br:6632/rest05/api/crm/v2/seller",
        headers={
            "Authorization": f"Bearer {token}"
        },
        verify=False
    )

    vendedores = sellers.json()

    lista_vendedores = vendedores.get("items", [])

    codigo_vendedor = None
    vendedor_encontrado = None

    for vendedor in lista_vendedores:

        email = vendedor.get("sellerEmail", "").strip().lower()

        if email == data.username.strip().lower():
            codigo_vendedor = vendedor.get("internalId", "").strip()
            vendedor_encontrado = vendedor
            break

    # caso não seja vendedor
    if not codigo_vendedor:
        return {
            "token": token,
            "message": "Login válido, mas usuário não é vendedor"
        }

    # caso seja vendedor
    return {
        "token": token,
        "seller_code": codigo_vendedor,
        "seller": vendedor_encontrado
    }