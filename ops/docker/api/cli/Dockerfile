FROM php:7.1-cli

# based on oficial image

#tini zlib-dev bash
#TODO: optimize it
RUN apt-get update
RUN apt-get install -y git subversion ssh openssl mercurial zlib1g-dev
#RUN rm -rf /var/lib/apt/lists/*

RUN echo "date.timezone=${PHP_TIMEZONE:-UTC}" > "$PHP_INI_DIR/conf.d/date_timezone.ini"

RUN apt-get install libcurl4-gnutls-dev && \
    docker-php-ext-install \
        pcntl \
        bcmath
#RUN docker-php-ext-install curl
#RUN docker-php-ext-install zip


RUN mkdir /code
WORKDIR /code

COPY ./labeling-api /code
