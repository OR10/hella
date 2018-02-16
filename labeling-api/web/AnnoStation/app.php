<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

const ENV_NAME_PROD = 'prod';
$env = getenv('APP_ENV') ?: ENV_NAME_PROD;

if ($notProd = ENV_NAME_PROD !== $env) {
    ini_set('display_errors',1);
}

$loader = require_once __DIR__ . '/../../app/bootstrap.php.cache';

// Enable APC for autoloading to improve performance.
// You should change the ApcClassLoader first argument to a unique prefix
// in order to prevent cache key conflicts with other applications
// also using APC.
/*
$apcLoader = new ApcClassLoader(sha1(__FILE__), $loader);
$loader->unregister();
$apcLoader->register(true);
*/

require_once __DIR__ . '/../../app/AnnoStation/AnnoStationKernel.php';
//require_once __DIR__.'/../app/AppCache.php';


$kernel = new AnnoStationKernel($env, $notProd);
$kernel->loadClassCache();

// When using the HttpCache, you need to call the method in your front controller instead of relying on the configuration parameter
//Request::enableHttpMethodParameterOverride();
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
