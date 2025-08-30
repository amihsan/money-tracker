#!/bin/sh

# Generate the env-config.js file for runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

# Start Nginx
exec nginx -g 'daemon off;'