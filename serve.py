import http.server
import socketserver
import sys
import webbrowser

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

class CustomHandler(Handler):
    # Disable default console log spamming for faster response
    def log_message(self, format, *args):
        pass

try:
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        print(f"Login Computers Dashboard Server successfully started.")
        print(f"Open http://localhost:{PORT} in your web browser.")
        sys.stdout.flush()
        
        # Auto-open browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        httpd.serve_forever()
except Exception as e:
    print(f"Error starting server: {e}")
    sys.stdout.flush()
    sys.exit(1)
