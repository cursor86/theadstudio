"""
Fetch product hero images for the affiliate ad catalog via Amazon's
ad-system widget image CDN (ws-na.amazon-adsystem.com), which serves
product images by ASIN independently of the main product page - a
separate path from the blocked amazon.com.au page-scraping route.

Usage: python3 fetch_catalog.py
"""

import os
import time
import urllib.request

CATALOG = {
    "Home_Kitchen": {
        "bentgo": "B07MW6PS55",
        "coffeebar": "B0F1JW5N4M",
        "closetorg": "B0732W7JXM",
        "stanley": "B0BVY86MGC",
        "oxo": "B0029096ZO",
        "josephjoseph": "B0C61X946K",
        "bambooorg": "B0CLVL8BSD",
        "bakingmat": "B0CMPTDTXN",
        "undersink": "B0B6TK767D",
        "spicerack": "B0CR6FZV6N",
    },
    "Baby_Nursery": {
        "bottlewarmer": "B0047RI5YU",
        "diaperbag": "B07B227J6W",
        "carrier": "B0747SSP7J",
        "aventbottles": "B07DMFRLZ3",
        "swaddle": "B07KX3Q5GL",
        "bathtoyorg": "B092GCF928",
        "babymonitor": "B0BCQ72NBJ",
        "pianogym": "B0CM3S3M52",
        "bouncer": "B08WQ755ZM",
        "nailtrimmer": "B07RTGW3XV",
    },
    "Fitness_Wellness": {
        "massagegun": "B0BCJVG8BZ",
        "redlightpanel": "B0CJ2V41CC",
        "compressionsock": "B08LS5VV47",
        "resistanceband": "B000LX4KRA",
        "abroller": "B0CCJH9GXK",
        "foamroller": "B018KFP8E4",
        "magnesium": "B0C5MN6QM3",
        "digestenzymes": "B074P9J29V",
        "coolingtowel": "B00VSH7LEM",
        "yogamat": "B0995TGYQ8",
    },
}

IMG_URL_TEMPLATE = (
    "https://ws-na.amazon-adsystem.com/widgets/q"
    "?_encoding=UTF8&ASIN={asin}&Format=_SL1500_&ID=AsinImage"
    "&MarketPlace=US&ServiceVersion=20070822&WS=1"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}


def fetch_image(asin: str, out_path: str) -> tuple[bool, str]:
    url = IMG_URL_TEMPLATE.format(asin=asin)
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
    except Exception as e:
        return False, f"request error: {e}"

    if len(data) < 2000:
        return False, f"response too small ({len(data)} bytes) - likely a placeholder/error image"

    with open(out_path, "wb") as f:
        f.write(data)
    return True, f"{len(data)} bytes"


def main():
    root = os.path.dirname(os.path.abspath(__file__))
    results = []

    for category, products in CATALOG.items():
        out_dir = os.path.join(root, "data", "images", category)
        os.makedirs(out_dir, exist_ok=True)

        for slug, asin in products.items():
            out_path = os.path.join(out_dir, f"{slug}.jpg")
            ok, detail = fetch_image(asin, out_path)
            status = "OK" if ok else "FAIL"
            print(f"[{status}] {category}/{slug} ({asin}): {detail}")
            results.append((category, slug, asin, ok, detail))
            time.sleep(0.5)

    ok_count = sum(1 for r in results if r[3])
    print(f"\n{ok_count}/{len(results)} images downloaded successfully.")


if __name__ == "__main__":
    main()
