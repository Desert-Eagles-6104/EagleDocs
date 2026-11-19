#!/usr/bin/env bash
set -euo pipefail

# Use local HTTPS credentials by default; CI can supply an SSH URL.
REPO_URL="${JAVADOC_REPO_URL:-https://github.com/Desert-Eagles-6104/offseason2026.git}"
BRANCH="dev"

TMP_DIR="_tmp_javadoc"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

rm -rf "$TMP_DIR"
# Check out the library revision recorded by the robot repository.
git clone --depth 1 --branch "$BRANCH" --recurse-submodules "$REPO_URL" "$TMP_DIR"

chmod +x "$TMP_DIR/gradlew"

(cd "$TMP_DIR" && ./gradlew -q javadoc)

# Keep the existing documentation if Gradle produces no Javadoc output.
if [[ ! -f "$TMP_DIR/build/docs/javadoc/index.html" ]]; then
  echo "Javadoc generation did not produce index.html" >&2
  exit 1
fi

rm -rf static/lib/javadoc
mkdir -p static/lib/javadoc
cp -R "$TMP_DIR/build/docs/javadoc/." static/lib/javadoc/

echo "Javadoc copied into static/lib/javadoc"
