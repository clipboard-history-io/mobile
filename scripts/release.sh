: "${EXPO_TOKEN:?}"

set -euo pipefail
trap 'kill $pid_ios $pid_android 2>/dev/null' EXIT

mkdir ./build

(
  eas build --platform ios --profile production --non-interactive --json --wait > ./build/ios.json
  curl --fail -L -H "Authorization: Bearer $EXPO_TOKEN" -o ./build/ios-clipboard-history-io-mobile.ipa "$(jq -r '.artifacts.buildUrl' ./build/ios.json)"
) & pid_ios=$!

(
  eas build --platform android --profile production --non-interactive --json --wait > ./build/android.json
  curl --fail -L -H "Authorization: Bearer $EXPO_TOKEN" -o ./build/android-clipboard-history-io-mobile.aab "$(jq -r '.artifacts.buildUrl' ./build/android.json)"
) & pid_android=$!

wait $pid_ios $pid_android
