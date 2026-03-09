FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY game.js /usr/share/nginx/html/game.js
COPY assets /usr/share/nginx/html/assets

EXPOSE 4173
