#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "usage: $0 <git-ref> <candidate-dir>" >&2
  exit 2
}

if [[ "$#" -ne 2 ]]; then
  usage
fi

git_ref="$1"
candidate_dir="$2"
repo_root="$(git rev-parse --show-toplevel)"
patch_file="${repo_root}/backend/scripts/observable-baseline-instrumentation.patch"

if [[ ! -f "${patch_file}" ]]; then
  echo "baseline capture: instrumentation patch not found: ${patch_file}" >&2
  exit 1
fi

source_commit="$(git -C "${repo_root}" rev-parse --verify "${git_ref}^{commit}")"

case "${candidate_dir}" in
  /*)
    candidate_absolute="${candidate_dir}"
    ;;
  *)
    candidate_absolute="$(pwd)/${candidate_dir}"
    ;;
esac

if [[ -e "${candidate_absolute}" ]] && find "${candidate_absolute}" -mindepth 1 -print -quit | grep -q .; then
  echo "baseline capture: candidate directory must be new or empty: ${candidate_absolute}" >&2
  exit 1
fi

patch_sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d ' ' -f 1
    return
  fi
  shasum -a 256 "$1" | cut -d ' ' -f 1
}

validate_patch_targets() {
  local target
  local found=0

  while IFS= read -r target; do
    found=1
    case "${target}" in
      backend/build.gradle|backend/src/atlasBaselineTest/*)
        ;;
      *)
        echo "baseline capture: forbidden instrumentation target: ${target}" >&2
        exit 1
        ;;
    esac
  done < <(sed -n 's|^+++ b/||p' "${patch_file}")

  if (( found == 0 )); then
    echo "baseline capture: instrumentation patch has no targets" >&2
    exit 1
  fi
}

validate_changed_paths() {
  local worktree="$1"
  local target
  local found=0

  while IFS= read -r target; do
    [[ -z "${target}" ]] && continue
    found=1
    case "${target}" in
      backend/build.gradle|backend/src/atlasBaselineTest/*)
        ;;
      *)
        echo "baseline capture: forbidden changed path after patch: ${target}" >&2
        exit 1
        ;;
    esac
  done < <(git -C "${worktree}" status --short | sed -E 's/^.. //')

  if (( found == 0 )); then
    echo "baseline capture: instrumentation patch produced no changes" >&2
    exit 1
  fi
}

validate_patch_targets

temporary_root="$(mktemp -d "${TMPDIR:-/tmp}/bangcheck-atlas-baseline.XXXXXX")"
temporary_worktree="${temporary_root}/worktree"
worktree_registered=0

cleanup() {
  if (( worktree_registered == 1 )); then
    git -C "${repo_root}" worktree remove --force "${temporary_worktree}" >/dev/null 2>&1 || true
  fi
  rm -rf "${temporary_root}"
}
trap cleanup EXIT

git -C "${repo_root}" worktree add --detach "${temporary_worktree}" "${source_commit}"
worktree_registered=1

git -C "${temporary_worktree}" apply --check "${patch_file}"
git -C "${temporary_worktree}" apply "${patch_file}"
validate_changed_paths "${temporary_worktree}"

mkdir -p "${candidate_absolute}/authority"

(
  cd "${temporary_worktree}/backend"
  # The source commit may carry a tracked machine-specific org.gradle.java.home pin.
  # Override it from the caller's JAVA_HOME so the capture measures product behaviour
  # at that commit. Build portability itself is asserted by check-portable-build.sh,
  # not by this capture.
  gradle_java_home_override=()
  if [[ -n "${JAVA_HOME:-}" ]]; then
    gradle_java_home_override=("-Dorg.gradle.java.home=${JAVA_HOME}")
  fi
  ./gradlew "${gradle_java_home_override[@]}" \
    atlasBaselineCapture -PatlasBaselineCandidateDir="${candidate_absolute}"
)

patch_digest="$(patch_sha256 "${patch_file}")"
{
  echo "instrumentation-patch-sha256=${patch_digest}"
  echo "source-commit=${source_commit}"
} > "${candidate_absolute}/authority/capture.txt"

echo "baseline capture: candidate created; review is required before approval"
