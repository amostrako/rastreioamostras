import requests
import time
import os

TOKEN = None
TOKEN_EXPIRATION = 0

def get_token():
    global TOKEN, TOKEN_EXPIRATION

    if TOKEN and time.time() < TOKEN_EXPIRATION:
        return TOKEN

    response = requests.post(
        os.getenv("API_URL"),
        params={"grant_type": "password"},
        data={
            "username": os.getenv("API_USERNAME"),
            "password": os.getenv("API_PASSWORD")
        },
        verify=False
    )

    data = response.json()

    TOKEN = data["access_token"]
    TOKEN_EXPIRATION = time.time() + data["expires_in"] - 60

    return TOKEN
