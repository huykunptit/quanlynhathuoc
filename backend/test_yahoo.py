import requests
from bs4 import BeautifulSoup

def search_yahoo_image(query):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    url = f"https://images.search.yahoo.com/search/images?p={query.replace(' ', '+')}"
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    for img in soup.find_all('img'):
        src = img.get('data-src') or img.get('src')
        if src and src.startswith('https://tse'):
            return src
    return None

print(search_yahoo_image("Panadol Extra Đỏ"))
