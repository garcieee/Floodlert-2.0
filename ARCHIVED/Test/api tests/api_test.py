import requests

url = "https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true"

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()  # Raise HTTPError for bad responses
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
