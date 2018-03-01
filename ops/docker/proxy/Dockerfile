FROM nginx:1.13

COPY ops/docker/proxy/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/proxy/config /etc/nginx/

CMD ["bash", "/usr/local/bin/boot.sh"]

