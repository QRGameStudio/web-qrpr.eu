#!/bin/bash

[ ! -f "service-worker.js" ] && cd ..
[ ! -f "service-worker.js" ] && {
  echo "Cannot find service worker" >&2
  exit 1
}
DIR_SERVICE_WORKER="$(realpath .)"
IGNORED_FILES="(offline-files-((web)|(libs)).txt)|(^\.)|(^scripts/)|(^LICENSE)|(^LICENSE)|(^README)|(^service-worker.js)|(^auto-update.txt)"

git ls-files | grep -Ev "$IGNORED_FILES" > "$DIR_SERVICE_WORKER/offline-files-web.txt"
cd ../web-libs || {
  echo "Cannot find web-libs"
}

git ls-files | grep -Ev "$IGNORED_FILES" > "$DIR_SERVICE_WORKER/offline-files-libs.txt"

echo "Cache files generated"
