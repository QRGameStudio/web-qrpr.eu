#!/usr/bin/env python3
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from mimetypes import guess_type
from os import path
host = 'localhost'
port = 5000


class MyServer(BaseHTTPRequestHandler):
    # noinspection PyPep8Naming
    def do_GET(self):
        if self.path == '/lib/_GOffline.js':
            self.send_response(200)
            self.send_header('Content-type', 'text/javascript')
            self.end_headers()
            self.wfile.write(b'console.log("[CACHE] disabled by development server")')
            return

        file_path = self.path[1:].replace('__lib__qrpr_eu', '../web-libs/')
        if not file_path:
            file_path = 'index.html'

        self.send_response(200)
        self.send_header('Content-type', guess_type(file_path, False)[0])
        self.end_headers()
        with open(file_path, 'rb') as f:
            content = f.read()
        self.wfile.write(content.replace(b'https://lib.qrpr.eu', b'/__lib__qrpr_eu'))


def main():
    while not path.isfile('service-worker.js'):
        os.chdir('..')
        if path.realpath(os.getcwd()) == '/':
            raise FileNotFoundError('Cannot find service worker')

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
