from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Backend funcionando!"

@app.route('/test')
def test():
    return "Test OK"

if __name__ == '__main__':
    print("Iniciando servidor na porta 8080...")
    app.run(debug=True, host='0.0.0.0', port=8080) 