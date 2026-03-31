import os
eq = chr(61)
nl = chr(10)
token = input("SCRAPER_TOKEN eingeben: ")
content = "SCRAPER_TOKEN" + eq + token + nl + "PORT" + eq + "3001" + nl
with open(".env", "w") as f:
    f.write(content)
print("Done! .env wurde erstellt.")
