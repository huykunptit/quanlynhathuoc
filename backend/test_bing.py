from bing_image_downloader import downloader

# Downloader saves to disk. We don't want to save to disk if possible, 
# but bing_image_downloader only downloads to a directory.
# Let's see if we can just scrape bing ourselves.

import urllib.request
import re

def get_bing_image(query):
    query = urllib.parse.quote_plus(query)
    url = f"https://www.bing.com/images/search?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        links = re.findall(r'murl&quot;:&quot;(.*?)&quot;', html)
        if links:
            return links[0]
    except Exception as e:
        print(e)
    return None

print(get_bing_image("Panadol Extra"))
