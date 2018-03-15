FROM nginx:1.13

COPY ops/docker/video/nginx/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/video/nginx/config /etc/nginx/

RUN mkdir /code
WORKDIR /code

CMD ["bash", "/usr/local/bin/boot.sh"]
