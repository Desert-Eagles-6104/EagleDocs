#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/Desert-Eagles-6104/offseason2025.git"
BRANCH="sim"

TMP_DIR="_tmp_javadoc"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

rm -rf "$TMP_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TMP_DIR"

(cd "$TMP_DIR" && ./gradlew -q javadoc)

rm -rf static/javadoc
mkdir -p static/javadoc
cp -R "$TMP_DIR/build/docs/javadoc/"* static/javadoc/

echo "Javadoc copied into static/javadoc"