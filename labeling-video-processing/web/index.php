<?php

ini_set('display_errors', 1);

require_once __DIR__.'/../vendor/autoload.php';

//require __DIR__.'/../src/Service/Storage/AbstractFactory.php';
//require __DIR__.'/../src/Service/Storage/StorageFactory.php';
//require __DIR__.'/../src/Service/Storage/CdnFactory.php';
//require __DIR__.'/../src/Service/Storage/AzureCmd.php';
//require __DIR__.'/../src/Service/Storage/FrameCdnAzure.php';
//require __DIR__.'/../src/Service/Storage/VideoCdnAzure.php';
$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/prod.php';
require __DIR__.'/../src/servicesInit.php';
require __DIR__.'/../src/controllers.php';
$app->run();
