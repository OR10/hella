<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Process\Process;


$app->put('/', function (Request $request) use ($app) {

    $frameSizesInBytes = $app['VideoFrameSplitter']->splitVideoInFrames(
        (string)$request->get('videoId'),
        (string)$request->get('videoName'),
        (string)$request->get('sourceFileFilename'),
        (string)$request->get('type'),
        (string)$app['cacheDirectory']
    );
    $imageSizes = $app['VideoFrameSplitter']->getImageSizes();

    $frameSizesInBytes = array(
        'frame' => $frameSizesInBytes,
        'image' => $imageSizes
    );

    return new JsonResponse($frameSizesInBytes);
});

$app->error(function (\Exception $e) {
    print($e->getMessage());
    exit();
});
