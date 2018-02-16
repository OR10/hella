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

COPY ops/docker/video/fpm/boot.sh /usr/local/bin/boot.sh
COPY ops/docker/video/fpm/config/fpm_www.conf /usr/local/etc/php-fpm.d/www.conf

RUN mkdir /code
WORKDIR /code

CMD ["bash", "/usr/local/bin/boot.sh"]


RUN echo "deb http://www.deb-multimedia.org jessie main non-free" >> /etc/apt/sources.list && \
    echo "deb-src http://www.deb-multimedia.org jessie main non-free" >> /etc/apt/sources.list && \
    apt-get update -y && \
    apt-get install -y --force-yes deb-multimedia-keyring && \
    apt-get update -y && \
    apt-get install -y \
        build-essential \
        gmerlin-encoders-ffmpeg \
        libfaac-dev \
        libmp3lame-dev \
        libopenjpeg-dev \
        libpostproc-dev \
        libpostproc52 \
        libspeex-dev \
        libtheora-dev \
        libvorbis-dev \
        libx264-dev \
        libxine2-ffmpeg \
        winff \
        yasm \
        pkg-config \
        wget && \
    rm -rf /var/lib/apt/lists/*

RUN set -x

ARG FFMPEG_VERSION=3.4.1

RUN mkdir /tmp/software && \
    cd /tmp/software && \
    wget http://ffmpeg.org/releases/ffmpeg-$FFMPEG_VERSION.tar.bz2 && \
    mkdir /tmp/src && \
    cd /tmp/src && \
    tar xvjf /tmp/software/ffmpeg-$FFMPEG_VERSION.tar.bz2 && \
    cd ffmpeg-$FFMPEG_VERSION && \
    ./configure \
        --enable-gpl \
        --enable-postproc \
        --enable-swscale \
        --enable-avfilter \
        --enable-libmp3lame \
        --enable-libvorbis \
        --enable-libtheora \
        --enable-libx264 \
        --enable-libspeex \
        --enable-shared \
        --enable-pthreads \
        --enable-libopenjpeg  \
#        --enable-libfaac \
        --enable-nonfree && \
    make -j 16 && \
    make install && \
    rm -R /tmp/software && \
    rm -R /tmp/src && \
    echo "include /usr/local/lib/" >> /etc/ld.so.conf && \
    ldconfig


RUN apt-get update -y && \
    apt-get install -y \
        python-pip && \
    pip install s3cmd && \
    apt-get --purge autoremove -y python-pip && \
    rm -rf /var/lib/apt/lists/*

COPY ./labeling-video-processing /code