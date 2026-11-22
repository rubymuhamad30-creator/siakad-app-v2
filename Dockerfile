FROM caddy:alpine
COPY . /srv
COPY Caddyfile /etc/caddy/Caddyfile
ENV PORT=8080
EXPOSE 8080