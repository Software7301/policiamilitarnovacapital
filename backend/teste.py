from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Funcionando!"

@app.route("/test")
def test():
    return "Test OK"

# Não coloque bloco main!