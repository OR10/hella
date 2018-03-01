FROM nginx:1.13

COPY ops/docker/api/nginx/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/api/nginx/config /etc/nginx/

RUN mkdir /code
WORKDIR /code

COPY ./labeling-api/web/AnnoStation /code

CMD ["bash", "/usr/local/bin/boot.sh"]
