import urllib.request

versions = [11076708, 10406996, 9477386, 9123335, 8512546, 7583922, 6609375]
for v in versions:
    url = f"https://dl.google.com/android/repository/commandlinetools-linux-{v}_latest.zip"
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"FOUND: {v} -> {resp.status} {url}")
            break
    except Exception as e:
        print(f"FAILED: {v} -> {e}")
