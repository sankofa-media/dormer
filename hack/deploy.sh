#!/usr/bin/env bash
# Deploys the image that CI published to GHCR for the current commit.
# Requires the Sankofa stand checkout for its km helper.
set -euo pipefail
cd "$(dirname "$0")/.."
repo=$PWD
stand=${SANKOFA_ROOT:-$HOME/projects/sankofa}
# shellcheck source=/dev/null
source "$stand/hack/stand/env.sh"
export DORMER_HOST=${DORMER_HOST:-dormer.sankofa.workshop.aenix.io}
[[ $DORMER_HOST =~ ^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$ ]] || { echo 'Invalid DORMER_HOST' >&2; exit 1; }
[[ $DORMER_HOST == dormer.sankofa.workshop.aenix.io ]] ||
  echo "Warning: the CI image is built for https://dormer.sankofa.workshop.aenix.io; canonical and sitemap URLs will not match $DORMER_HOST" >&2
crane=${CRANE:-$HOME/go/bin/crane}
image=ghcr.io/sankofa-media/dormer
tag=sha-$(git rev-parse --short=7 HEAD)
work=$(mktemp -d "${TMPDIR:-/tmp}/dormer-deploy.XXXXXX")
trap 'rm -rf "$work"' EXIT
if ! digest=$("$crane" digest "$image:$tag" 2>"$work/crane.err"); then
  cat "$work/crane.err" >&2
  echo "Image $image:$tag not found. Push this commit to main and wait for the Images workflow." >&2
  exit 1
fi
[[ $digest =~ ^sha256:[a-f0-9]{64}$ ]] || { echo "Unexpected digest: $digest" >&2; exit 1; }
export DORMER_IMAGE=$image@$digest
mkdir -p dist
sed -e "s#DORMER_IMAGE#$DORMER_IMAGE#g" -e "s#DORMER_HOST#$DORMER_HOST#g" deploy/dormer.yaml > dist/dormer.yaml
km apply -f "$repo/dist/dormer.yaml"
km -n dormer rollout status deploy/dormer --timeout=180s
# Validate TLS and that the public host serves this image.
for _ in {1..20}; do
  if curl --fail --silent --show-error --max-time 20 "https://$DORMER_HOST/healthz" -o /dev/null; then
    echo "Deployed $DORMER_IMAGE at https://$DORMER_HOST"
    exit 0
  fi
  sleep 3
done
echo "https://$DORMER_HOST does not answer yet" >&2
exit 1
