#!/usr/bin/env python3
"""天衡：本地预览服务器，禁用缓存（MD2 改造期反复刷新看效果用）"""
import http.server, socketserver, functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

handler = functools.partial(NoCacheHandler, directory='.')
with socketserver.TCPServer(('0.0.0.0', 8001), handler) as httpd:
    httpd.serve_forever()
