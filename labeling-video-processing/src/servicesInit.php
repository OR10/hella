<?php

// Dependency injection setupping

$cacheFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/cache');
$app['cacheFilesystem'] = new \League\Flysystem\Filesystem($cacheFilesystemAdapter);

$frameCdnFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/frameCdn');
$frameCdnFilesystem        = new \League\Flysystem\Filesystem($frameCdnFilesystemAdapter);

$app['FrameCmd'] = (new \Service\Storage\StorageFactory($app))->getStorageFrame();
$app['VideoCmd'] = (new \Service\Storage\StorageFactory($app))->getStorageVideo();

//for work with file system

//$app['Filesystem'] = new League\Flysystem\Filesystem();
//$app['Flysystem'] = function ($app) {
//    return new Service\Flysystem('base_url', $app['Filesystem']);
//};

$app['FrameCdn'] = function ($app) {
    return (new \Service\Storage\CdnFactory($app))->getCdnFrame();
};
$app['VideoCdn'] = function ($app) {
    return (new \Service\Storage\CdnFactory($app))->getCdnVideo();
};

$app['VideoFrameSplitter'] = function ($app) {
    return new Service\VideoFrameSplitter(
        $app['FrameCdn'],
        $app['VideoCdn'],
        $app['ffmpeg_executable'],
        $app['cacheFilesystem']
    );
};
