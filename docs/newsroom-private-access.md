# Private newsroom access at launch

The owner chose **private network/IP access** for the production newsroom. This is a deployment gate. The application currently provides staff authentication, role checks, noindex headers, no-store responses, a 12-hour server-side session and same-origin mutation checks. These controls protect data, but a login URL remains reachable to anyone who can reach the web server until the network gate is configured.

At deployment, run Next.js only on `127.0.0.1` behind Nginx. Restrict all of these paths to the approved VPN exit IP or a small owner-approved IP list:

- `/newsroom` and `/newsroom/…`, including the sign-in page
- `/api/newsroom/…`, including sign-in, sign-out and every editorial action

Use one Nginx include file containing `allow` lines followed by `deny all;`. Apply it to each matching location. For example, inside the existing HTTPS `server` block:

```nginx
# Define once in the http block; tune after staging traffic review.
limit_req_zone $binary_remote_addr zone=tdag_staff_login:10m rate=5r/m;

# In the news.thedigitalagame.com HTTPS server block:
location = /newsroom {
    include /etc/nginx/snippets/tdag-newsroom-allowlist.conf;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
location ^~ /newsroom/ {
    include /etc/nginx/snippets/tdag-newsroom-allowlist.conf;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
location ^~ /api/newsroom/ {
    include /etc/nginx/snippets/tdag-newsroom-allowlist.conf;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
# This exact location takes priority over the prefix above.
location = /api/newsroom/session {
    include /etc/nginx/snippets/tdag-newsroom-allowlist.conf;
    limit_req zone=tdag_staff_login burst=5 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Allowlist file example (replace the documentation IP before use):

```nginx
allow 203.0.113.10;
deny all;
```

Validate Nginx with `nginx -t` and test from both an allowed and a disallowed network before applying it. Ensure the owner has a working VPN or stable exit IP to avoid self-lockout. Do not expose port 3000 publicly. Keep the public site and its static assets reachable normally. These settings have **not** been deployed or tested on Hostinger yet.
