import http.server
import socketserver
import threading
import time

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"Servidor funcionando!")
        else:
            super().do_GET()

def start_server():
    PORT = 8080
    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    print("Iniciando servidor HTTP simples...")
    start_server() 