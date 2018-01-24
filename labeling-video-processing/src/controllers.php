<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Process\Process;


$app->get('/', function (Request $request) use ($app) {

    $frameSizesInBytes = $app['VideoFrameSplitter']->splitVideoInFrames(
        (int)$request->query->get('videoId'),
        $request->query->get('sourceFileFilename'),
        $request->query->get('type')
    );
    $imageSizes = $app['VideoFrameSplitter']->getImageSizes();

    $frameSizesInBytes = json_encode(array(
        'frame' => $frameSizesInBytes,
        'image' => $imageSizes
    ));


    return new JsonResponse($frameSizesInBytes);
});

$app->error(function (\Exception $e) {
    print($e->getMessage());
    exit();
});
