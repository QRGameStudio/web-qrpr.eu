#!/bin/bash
PORT="$1"
[ -z "$PORT" ] && PORT="5000"
/usr/bin/env python3 -m http.server --cgi "$PORT"
