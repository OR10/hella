<?php

use Symfony\Component\Debug\Debug;

const ENV_NAME_DEV = 'dev';
const ENV_NAME_PROD = 'prod';

$env = getenv('APP_ENV') ?: ENV_NAME_PROD;

if ($notProd = ENV_NAME_PROD !== $env) {
    ini_set('display_errors',1);
    //TODO: use more environments
    $env = ENV_NAME_DEV;
}

require_once __DIR__.'/../vendor/autoload.php';

if ($notProd = ENV_NAME_PROD !== $env) {
    Debug::enable();
}

$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/' . $env . '.php';
require __DIR__.'/../src/servicesInit.php';
require __DIR__.'/../src/controllers.php';

$app->run();
