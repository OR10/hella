FROM php:7.1-fpm

# apt-get install -y apt-utils libmcrypt-dev libpq-dev netcat libfreetype6-dev libjpeg62-turbo-dev libpng12-dev libpng-

RUN apt-get update && \
    apt-get install -y apt-utils libmcrypt-dev libpq-dev netcat libfreetype6-dev libjpeg62-turbo-dev libpng-dev zlib1g-dev libicu-dev g++ && \
    rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
        bcmath \
        mbstring \
        opcache \
        zip

#install gd library
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl \
    && docker-php-ext-install -j$(nproc) intl \
    && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
    && docker-php-ext-install -j$(nproc) gd

RUN pecl install -o -f redis \
    && rm -rf /tmp/pear \
    && docker-php-ext-enable redis

#install Imagemagick & PHP Imagick ext
RUN apt-get update && apt-get install -y \
        libmagickwand-dev --no-install-recommends

RUN pecl install imagick && docker-php-ext-enable imagick

COPY ops/docker/api/fpm/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/api/fpm/config/fpm_www.conf /usr/local/etc/php-fpm.d/www.conf

RUN mkdir /code
WORKDIR /code

CMD ["bash", "/usr/local/bin/boot.sh"]

RUN apt-get update -y && \
    apt-get install -y \
        libav-tools \
        python-pip && \
    pip install s3cmd && \
    rm -rf /var/lib/apt/lists/*
#Do not remove pip. It will break s3cmd

COPY ops/docker/video/fpm/config/conf.d/custom.ini /usr/local/etc/php/conf.d/custom.ini

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/tideways/php-profiler-extension.git /tmp/x \
    && cd /tmp/x \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && echo "extension=tideways_xhprof.so" > /usr/local/etc/php/php.ini \
    && rm -R /tmp/x

COPY ./labeling-api /code
