<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

$loader = require_once __DIR__ . '/../../app/ProfilingFacade.php';
const ENV_NAME_PROD = 'prod';
$env = getenv('APP_ENV') ?: ENV_NAME_PROD;

if ($notProd = ENV_NAME_PROD !== $env) {
    ini_set('display_errors', 1);
}

ProfilingFacade::start();

try {
    $loader = require_once __DIR__ . '/../../app/AnnoStation/bootstrap.php.cache';

    require_once __DIR__ . '/../../app/AnnoStation/AnnoStationKernel.php';

    $kernel = new AnnoStationKernel($env, $notProd);
    $kernel->loadClassCache();

// When using the HttpCache, you need to call the method in your front controller instead of relying on the configuration parameter
//Request::enableHttpMethodParameterOverride();
    $request = Request::createFromGlobals();
    $response = $kernel->handle($request);
    $response->send();
    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    throw $e;
} finally {
    ProfilingFacade::stop('api');
}

