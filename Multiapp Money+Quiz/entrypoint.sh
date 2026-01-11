#!/bin/sh

# --------------------------
# Quiz App Environment
# --------------------------
cat <<EOF > /usr/share/nginx/html/quiz/env-config.js
window._env_ = {
 VITE_API_URL: "${VITE_API_URL}",
};
EOF

# --------------------------
# Money Tracker App Environment
# --------------------------
cat <<EOF > /usr/share/nginx/html/money/env-config.js
window._env_ = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_AWS_REGION: "${VITE_AWS_REGION}",
  VITE_AWS_USER_POOL_ID: "${VITE_AWS_USER_POOL_ID}",
  VITE_AWS_APP_CLIENT_ID: "${VITE_AWS_APP_CLIENT_ID}",
  VITE_AWS_IDENTITY_POOL_ID: "${VITE_AWS_IDENTITY_POOL_ID}",
  VITE_AWS_COGNITO_REGION: "${VITE_AWS_COGNITO_REGION}",
  VITE_AWS_COGNITO_DOMAIN: "${VITE_AWS_COGNITO_DOMAIN}",
  VITE_AWS_REDIRECT_SIGNIN: "${VITE_AWS_REDIRECT_SIGNIN}",
  VITE_AWS_REDIRECT_SIGNOUT: "${VITE_AWS_REDIRECT_SIGNOUT}"
};
EOF

# --------------------------
# Start Nginx
# --------------------------
exec nginx -g 'daemon off;'
