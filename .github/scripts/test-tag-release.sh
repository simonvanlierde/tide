#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd "$(dirname "$0")" && pwd)
scratch=$(mktemp -d "${TMPDIR:-/tmp}/tide-tag-release.XXXXXX")
trap 'rm -rf "$scratch"' EXIT
mkdir "$scratch/bin"
# The fake never calls git, signs a tag, pushes, or records inherited variables.
cat >"$scratch/bin/git" <<'GIT'
#!/usr/bin/env bash
set -euo pipefail
case "$1" in
  fetch | diff | verify-tag) exit 0 ;;
  show)
    case "$2" in
      *:CHANGELOG.md) echo '## [0.5.0] - 2026-11-10' ;;
      *:package.json) printf '{"version":"%s"}\n' "$TEST_MANIFEST_VERSION" ;;
      *) exit 2 ;;
    esac ;;
  rev-parse)
    if [[ $2 == --quiet ]]; then exit 1; fi
    echo fixture-commit ;;
  tag | push) echo "$1" >>"$TEST_ACTIONS" ;;
  *) exit 2 ;;
esac
GIT
chmod +x "$scratch/bin/git"

if env -i PATH="$scratch/bin:$PATH" TEST_MANIFEST_VERSION=0.4.0 TEST_ACTIONS="$scratch/actions" \
  bash "$script_dir/tag-release.sh" 0.5.0 >"$scratch/output" 2>&1; then
  echo 'FAIL: a mismatched manifest was accepted' >&2
  exit 1
fi
grep -F 'package.json on origin/main has version 0.4.0, expected 0.5.0' "$scratch/output"
[[ ! -e $scratch/actions ]] || {
  echo 'FAIL: a mismatched manifest reached tag or push' >&2
  exit 1
}

env -i PATH="$scratch/bin:$PATH" TEST_MANIFEST_VERSION=0.5.0 TEST_ACTIONS="$scratch/actions" \
  bash "$script_dir/tag-release.sh" 0.5.0
printf 'tag\npush\n' >"$scratch/expected"
cmp "$scratch/expected" "$scratch/actions"
echo 'PASS: manifest mismatch stops before tagging; a matching version reaches tag and push'
