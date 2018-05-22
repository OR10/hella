FROM php:7.1-fpm

RUN apt-get update -y \
    && apt-get install -y graphviz git

RUN mkdir /code \
    && git clone https://github.com/phacility/xhprof.git /code

WORKDIR /code
EXPOSE 80
