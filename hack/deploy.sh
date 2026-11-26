#!/usr/bin/env bash
# Requires the Sankofa stand checkout and its existing registry/cluster helpers.
set -euo pipefail
cd "$(dirname "$0")/.."
repo=$PWD
stand=${SANKOFA_ROOT:-$HOME/projects/sankofa}
source "$stand/hack/stand/env.sh"
export DORMER_HOST=${DORMER_HOST:-dormer.sankofa.workshop.aenix.io}
export SITE_URL=${SITE_URL:-https://$DORMER_HOST}
[[ $DORMER_HOST =~ ^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$ ]] || { echo 'Invalid DORMER_HOST' >&2; exit 1; }
crane=${CRANE:-$HOME/go/bin/crane}
work=$(mktemp -d "${TMPDIR:-/tmp}/dormer-deploy.XXXXXX")
trap 'rm -rf "$work"' EXIT
npm ci
npm run build
# Separate art and site layers so unchanged art is not pushed again.
mkdir -p "$work/media/usr/share/nginx/html" "$work/site/usr/share/nginx/html" "$work/site/etc/nginx/conf.d"
cp -R dist/media "$work/media/usr/share/nginx/html/"
rsync -a --exclude /media dist/ "$work/site/usr/share/nginx/html/"
cp deploy/nginx.conf "$work/site/etc/nginx/conf.d/default.conf"
tars=()
for layer in media site; do
  (
    cd "$work/$layer"
    find . -type d -exec chmod 755 {} +
    find . -type f -exec chmod 644 {} +
    TZ=UTC find . -exec touch -h -t 202601010000 {} +
    find . -mindepth 1 | LC_ALL=C sort | COPYFILE_DISABLE=1 tar --uid 0 --gid 0 --uname root --gname root --no-recursion -cf "$work/$layer.tar" -T -
  )
  tars+=(-f "$work/$layer.tar")
done
"$crane" append --platform linux/amd64 -b nginxinc/nginx-unprivileged:1.29-alpine \
  "${tars[@]}" -t sankofa/dormer:dev -o "$work/dormer.tar" >/dev/null
# push.sh changes directory internally; pass an absolute tarball path.
DORMER_IMAGE=$(cd "$stand" && hack/stand/push.sh dormer "$work/dormer.tar" | tail -1)
[[ $DORMER_IMAGE =~ ^localhost:5000/sankofa/dormer@sha256:[a-f0-9]{64}$ ]] || { echo 'push failed' >&2; exit 1; }
export DORMER_IMAGE
sed -e "s#DORMER_IMAGE#$DORMER_IMAGE#g" -e "s#DORMER_HOST#$DORMER_HOST#g" deploy/dormer.yaml > dist/dormer.yaml
# Optional: keep an old host as a permanent redirect to the canonical one.
if [[ -n ${DORMER_OLD_HOST:-} && $DORMER_OLD_HOST != "$DORMER_HOST" ]]; then
  [[ $DORMER_OLD_HOST =~ ^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$ ]] || { echo 'Invalid DORMER_OLD_HOST' >&2; exit 1; }
  { echo '---'; sed -e "s#DORMER_OLD_HOST#$DORMER_OLD_HOST#g" -e "s#DORMER_HOST#$DORMER_HOST#g" deploy/dormer-redirect.yaml; } >> dist/dormer.yaml
fi
km apply -f "$repo/dist/dormer.yaml"
km -n dormer rollout status deploy/dormer --timeout=180s
# Validate TLS and compare the public HTML to the build just deployed.
for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 20 "https://$DORMER_HOST/" -o "$work/served.html" && cmp -s dist/index.html "$work/served.html"; then
    echo "Deployed $DORMER_IMAGE at https://$DORMER_HOST"
    exit 0
  fi
  sleep 3
done
echo 'The public host does not yet serve this build' >&2
exit 1
