# nginx 는 순수 바이너리라 musl 문제가 없다 - 여기서는 alpine 을 써도 안전하다.
# (dev-data-embed 는 sqlite-vec 때문에 slim 을 썼다)
FROM nginx:alpine

COPY public/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
