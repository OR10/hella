<?php

// configure your app for the production environment
$app['s3CmdExecutable'] = 's3cmd';
$app['parallelExecutable'] = 'parallel';
$app['numberOfParallelConnections'] = 10;
$app['cacheDirectory'] = '/var/cache/labeling_api';
$app['bucket'] = getenv('S3_BUCKET_FRAME');
$app['videoBucket'] = getenv('S3_BUCKET_VIDEO');
$app['accessKey'] = getenv('S3_KEY');
$app['secretKey'] = getenv('S3_SECRET');
$app['hostBase'] = getenv('S3_HOST');
$app['hostBucket'] = getenv('S3_HOST');

$app['base_url'] = getenv('S3_BASE_URL');
$app['cacheDir'] = '/var/cache/labeling_api';

$app['ffmpeg_executable'] = 'avconv';
