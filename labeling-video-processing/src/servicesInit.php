<?php

// Dependency injection setupping

$cacheFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/cache');
$app['cacheFilesystem'] = new \League\Flysystem\Filesystem($cacheFilesystemAdapter);

$frameCdnFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/frameCdn');
$frameCdnFilesystem        = new \League\Flysystem\Filesystem($frameCdnFilesystemAdapter);

$app['Cmd'] = new Service\Cmd(
    $app['s3CmdExecutable'],
    $app['parallelExecutable'],
    $app['numberOfParallelConnections'],
    $app['cacheDirectory'],
    $app['bucket'],
    $app['accessKey'],
    $app['secretKey'],
    $app['hostBase'],
    $app['hostBucket']
);

//for work with file system

//$app['Filesystem'] = new League\Flysystem\Filesystem();
//$app['Flysystem'] = function ($app) {
//    return new Service\Flysystem('base_url', $app['Filesystem']);
//};
$app['Flysystem'] = function ($app) {
    return new Service\S3Cmd($app['base_url'], $app['cacheDir'], $app['Cmd']);
};

$app['VideoFrameSplitter'] = function ($app) {
    return new Service\VideoFrameSplitter(
        $app['Flysystem'],
        $app['ffmpeg_executable'],
        $app['cacheFilesystem']
    );
};
