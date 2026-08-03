#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
build_files=(
  "backend/.java-version"
  "backend/README.md"
  "backend/Dockerfile"
  "backend/build.gradle"
  "backend/docker-compose.yml"
  "backend/gradle.properties"
  "backend/settings.gradle"
  "backend/gradle/wrapper/gradle-wrapper.properties"
)
forbidden_literals=(
  "org.gradle.java.home="
  "/Users/"
  "/home/"
  "/opt/homebrew/Cellar/"
  "C:\\Users\\"
)
forbidden_runtime_features=(
  "--enable-preview"
  "jdk.incubator"
  "StructuredTaskScope"
)

matches_forbidden_literal() {
  local value="$1"
  local literal

  for literal in "${forbidden_literals[@]}"; do
    if [[ "${value}" == *"${literal}"* ]]; then
      return 0
    fi
  done

  return 1
}

matches_forbidden_runtime_feature() {
  local value="$1"
  local feature

  for feature in "${forbidden_runtime_features[@]}"; do
    if [[ "${value}" == *"${feature}"* ]]; then
      return 0
    fi
  done

  return 1
}

if [[ "${1:-}" == "--self-test" ]]; then
  bad_samples=(
    "org.gradle.java.home=/jdk"
    "/Users/alice/.jdks/17"
    "/home/alice/.jdks/17"
    "/opt/homebrew/Cellar/openjdk@17/17.0.20/libexec/openjdk.jdk"
    "C:\\Users\\alice\\.jdks\\17"
  )
  good_samples=(
    "17"
    "/opt/homebrew/opt/openjdk@17"
    "\${JAVA_HOME}/bin"
    "JavaLanguageVersion.of(17)"
    "spring.threads.virtual.enabled=false"
  )
  bad_runtime_samples=(
    "java --enable-preview"
    "requires jdk.incubator.concurrent"
    "new StructuredTaskScope.ShutdownOnFailure()"
  )

  for sample in "${bad_samples[@]}"; do
    if ! matches_forbidden_literal "${sample}"; then
      echo "portable-build gate self-test: expected rejection: ${sample}" >&2
      exit 1
    fi
  done

  for sample in "${bad_runtime_samples[@]}"; do
    if ! matches_forbidden_runtime_feature "${sample}"; then
      echo "portable-build gate self-test: expected runtime feature rejection: ${sample}" >&2
      exit 1
    fi
  done

  for sample in "${good_samples[@]}"; do
    if matches_forbidden_literal "${sample}" || matches_forbidden_runtime_feature "${sample}"; then
      echo "portable-build gate self-test: expected acceptance: ${sample}" >&2
      exit 1
    fi
  done

  echo "portable-build gate self-test: PASS"
  exit 0
fi

failed=0
absolute_build_files=()

for file in "${build_files[@]}"; do
  if [[ ! -f "${repo_root}/${file}" ]]; then
    echo "portable-build gate: missing tracked build file: ${file}" >&2
    failed=1
    continue
  fi
  absolute_build_files+=("${repo_root}/${file}")
done

# Do not parse required inputs after reporting that they are absent. This keeps the
# gate's own diagnostic instead of leaking a shell redirection error.
if (( failed != 0 )); then
  exit 1
fi

for literal in "${forbidden_literals[@]}"; do
  if grep -nF -- "${literal}" "${absolute_build_files[@]}"; then
    echo "portable-build gate: forbidden machine-specific path or JDK pin: ${literal}" >&2
    failed=1
  fi
done

java_version_file="${repo_root}/backend/.java-version"
java_version="$(tr -d '[:space:]' < "${java_version_file}")"
if [[ ! "${java_version}" =~ ^[0-9]+$ ]]; then
  echo "portable-build gate: backend/.java-version must contain one decimal Java major" >&2
  failed=1
fi

if ! grep -qF -- "JavaLanguageVersion.of(${java_version})" "${repo_root}/backend/build.gradle"; then
  echo "portable-build gate: build.gradle toolchain must match backend/.java-version (${java_version})" >&2
  failed=1
fi

runtime_targets=(
  "${repo_root}/backend/build.gradle"
  "${repo_root}/backend/gradle.properties"
  "${repo_root}/backend/Dockerfile"
  "${repo_root}/backend/src/main"
  "${repo_root}/.github/workflows"
)
for feature in "${forbidden_runtime_features[@]}"; do
  if grep -RnF -- "${feature}" "${runtime_targets[@]}"; then
    echo "portable-build gate: preview or incubator runtime feature is forbidden: ${feature}" >&2
    failed=1
  fi
done

if ! grep -A3 -F -- "threads:" "${repo_root}/backend/src/main/resources/application.yaml" \
  | grep -qF -- "enabled: false"; then
  echo "portable-build gate: spring.threads.virtual.enabled must be explicitly false" >&2
  failed=1
fi

legacy_search_tool="r""g"
if grep -nE "(^|[[:space:]])${legacy_search_tool}([[:space:]]|$)" "${BASH_SOURCE[0]}"; then
  echo "portable-build gate: gate implementation must not depend on ${legacy_search_tool}" >&2
  failed=1
fi

if (( failed != 0 )); then
  exit 1
fi

echo "portable-build gate: PASS"
