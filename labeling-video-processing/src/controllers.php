<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Process\Process;


$app->get('/', function (Request $request) use ($app) {

    $frameSizesInBytes = $app['VideoFrameSplitter']->splitVideoInFrames(
        (string)$request->query->get('videoId'),
        (string)$request->query->get('videoName'),
        $request->query->get('sourceFileFilename'),
        $request->query->get('type'),
        $app['cacheDirectory']
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
