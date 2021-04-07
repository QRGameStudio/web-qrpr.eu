#!/usr/bin/env python3
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from mimetypes import guess_type
from pathlib import Path
from sys import argv
from typing import Optional

host = 'localhost'
port = 5000


class MyServer(BaseHTTPRequestHandler):
    web_libs_path: Optional[Path] = None

    # noinspection PyPep8Naming
    def do_GET(self):
        if self.path == '/lib/_GOffline.js':
            self.send_response(200)
            self.send_header('Content-type', 'text/javascript')
            self.end_headers()
            self.wfile.write(b'console.log("[CACHE] disabled by development server")')
            return

        file_path = self.path[1:]
        if not file_path:
            file_path = 'index.html'

        if self.web_libs_path and file_path.startswith('__lib__qrpr_eu'):
            file_path = file_path.replace('__lib__qrpr_eu', f"{self.web_libs_path.absolute()}")

        if not Path(file_path).exists():
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Not found')
            return

        self.send_response(200)
        self.send_header('Content-type', guess_type(file_path, False)[0])
        self.end_headers()
        with open(file_path, 'rb') as f:
            content = f.read()
        if self.web_libs_path is not None:
            content = content.replace(b'https://lib.qrpr.eu', b'/__lib__qrpr_eu')
        self.wfile.write(content)


def main():
    os.chdir(Path(argv[0]).absolute().parent.absolute().parent.absolute())

    assert Path('service-worker.js').is_file(), 'located in wrong directory'

    path_web_libs = Path('../web-libs/')
    if path_web_libs.exists():
        print('Using local version of web libs')
        MyServer.web_libs_path = path_web_libs

    server = HTTPServer((host, port), MyServer)
    print('Server started http://%s:%d' % (host, port))

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

    server.server_close()
    print('Server stopped.')


if __name__ == '__main__':
    main()
