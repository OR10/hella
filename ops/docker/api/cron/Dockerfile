FROM php:7.1-cli
# based on oficial image

#TODO: optimize it
RUN apt-get update && \
    apt-get install -y git subversion ssh openssl mercurial zlib1g-dev && \
    rm -rf /var/lib/apt/lists/* && \
    echo "date.timezone=${PHP_TIMEZONE:-UTC}" > "$PHP_INI_DIR/conf.d/date_timezone.ini"

RUN apt-get update && \
    apt-get install libcurl4-gnutls-dev && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-install \
        pcntl \
        bcmath
#opcache \
#RUN docker-php-ext-install curl
#RUN docker-php-ext-install zip

RUN mkdir /code
WORKDIR /code

#cron
RUN apt-get update && \
    apt-get -y install cron && \
    rm -rf /var/lib/apt/lists/*

ADD ./ops/docker/api/cron/crontab /etc/cron.d/republisher-cron

RUN chmod 0644 /etc/cron.d/republisher-cron

CMD service cron start

COPY ./labeling-api /code
