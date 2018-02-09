FROM php:7.1-fpm

RUN apt-get update && \
    apt-get install -y libmcrypt-dev libpq-dev netcat && \
    rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
#        mcrypt \
        bcmath \
        mbstring \
#        zip \
        opcache

COPY ops/docker/api/fpm/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/api/fpm/config/fpm_www.conf /usr/local/etc/php-fpm.d/www.conf

RUN mkdir /code
WORKDIR /code

CMD ["bash", "/usr/local/bin/boot.sh"]

COPY ./labeling-api /code

RUN apt-get update -y && \
    apt-get install -y \
        libav-tools \
        python-pip && \
    pip install s3cmd && \
    apt-get --purge autoremove -y python-pip && \
    rm -rf /var/lib/apt/lists/*
