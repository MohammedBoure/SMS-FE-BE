import os
import sys
from flask import Flask, send_from_directory

project_root = ""

app = Flask(__name__, static_folder=project_root, static_url_path='')

@app.route('/')
def index():
    return send_from_directory(project_root, 'index.html')

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=46758)
    except PermissionError:
        print("\n[Error] Permission denied for Port 80. Do you have administrator rights?")
        print("... Starting server on Port 5000 instead ...\n")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except OSError as e:
        if e.errno == 10013 or e.errno == 13 or e.errno == 98: # (WinError 10013) / EACCES (13) / EADDRINUSE (98)
             print(f"\n[Error] Could not bind to Port 80 (Error: {e.strerror}).")
             print("... Starting server on Port 5000 instead ...\n")
             app.run(debug=True, host='0.0.0.0', port=5000)
        else:
            raise e 