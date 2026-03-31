key = input("OPENAI_API_KEY: ")
with open(".env", "a") as f:
    f.write("OPENAI_API_KEY" + chr(61) + key + "\n")
print("Done")
