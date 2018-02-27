FROM nginx:1.13

COPY ops/docker/front/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/front/config /etc/nginx/

RUN mkdir /code
WORKDIR /code

COPY ./labeling-ui /code

CMD ["bash", "/usr/local/bin/boot.sh"]
