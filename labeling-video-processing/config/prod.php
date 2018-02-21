<?php

// configure your app for the production environment
$app['twig.path'] = array(__DIR__.'/../templates');
$app['twig.options'] = array('cache' => __DIR__.'/../var/cache/twig');

$app['s3CmdExecutable'] = 's3cmd';
$app['parallelExecutable'] = 'parallel';
$app['numberOfParallelConnections'] = 10;
$app['cacheDirectory'] = '/var/cache/labeling_api';
$app['bucket'] = 'hella-frame-cdn';
$app['videoBucket'] = 'hella-video-cdn';
$app['accessKey'] = 'AKIAJBJFNWIUTN5B2S2A';
$app['secretKey'] = '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';
$app['hostBase'] = 's3.eu-central-1.amazonaws.com';
$app['hostBucket'] = 's3.eu-central-1.amazonaws.com';

$app['base_url'] = 'https://s3.eu-central-1.amazonaws.com';
$app['cacheDir'] = '/var/cache/labeling_api';


$app['ffmpeg_executable'] = 'avconv';