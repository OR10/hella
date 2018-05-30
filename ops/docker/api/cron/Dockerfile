FROM php:7.1-cli
# based on oficial image

# libjpeg62-turbo-dev libpng12-dev libpng-dev zlib1g-dev libicu-dev g++  && \

#TODO: optimize it
RUN apt-get update && \
    apt-get install -y git subversion ssh openssl mercurial apt-utils libmcrypt-dev libpq-dev netcat libfreetype6-dev libjpeg62-turbo-dev libpng-dev zlib1g-dev libicu-dev g++  && \
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
RUN docker-php-ext-install zip
#install gd library
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl \
    && docker-php-ext-install -j$(nproc) intl \
    && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
    && docker-php-ext-install -j$(nproc) gd

RUN mkdir /code
WORKDIR /code

#cron
RUN apt-get update && \
    apt-get -y install cron && \
    rm -rf /var/lib/apt/lists/*

ADD ./ops/docker/api/cron/crontab /etc/cron.d/republisher-cron

RUN chmod 0644 /etc/cron.d/republisher-cron

CMD service cron start

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

RUN git clone https://github.com/tideways/php-profiler-extension.git /tmp/x \
    && cd /tmp/x \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && echo "extension=tideways_xhprof.so" > /usr/local/etc/php/php.ini \
    && rm -R /tmp/x

COPY ./labeling-api /code
