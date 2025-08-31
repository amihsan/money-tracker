#!/bin/sh

# Generate the env-config.js file for runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_AWS_REGION: "${VITE_AWS_REGION}",
  VITE_AWS_USER_POOL_ID: "${VITE_AWS_USER_POOL_ID}",
  VITE_AWS_APP_CLIENT_ID: "${VITE_AWS_APP_CLIENT_ID}",
  VITE_AWS_IDENTITY_POOL_ID: "${VITE_AWS_IDENTITY_POOL_ID}"
  VITE_AWS_COGNITO_REGION: "${VITE_AWS_COGNITO_REGION}"
};
EOF

# Start Nginx
exec nginx -g 'daemon off;'
