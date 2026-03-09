import requests
import base64

BASE_URL = "https://protheus.quatroktextil.com.br:6632/rest05"

CLIENT_ID = "SEU_CLIENT_ID"
CLIENT_SECRET = "SEU_CLIENT_SECRET"

def get_token():
    # monta client_id:client_secret em base64
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    base64_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {base64_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(
        f"{BASE_URL}/api/oauth2/v1/token",
        headers=headers,
        data=data,
        verify=False
    )

    response.raise_for_status()  # ajuda a identificar erro

    return response.json()["access_token"]
