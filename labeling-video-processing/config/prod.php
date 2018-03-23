<?php

// configure your app for the production environment
$app['s3CmdExecutable'] = 's3cmd';
$app['parallelExecutable'] = 'parallel';
$app['numberOfParallelConnections'] = 10;
$app['cacheDirectory'] = '/code/var/cache/labeling_api';
$app['bucket'] = getenv('S3_BUCKET_FRAME');
$app['videoBucket'] = getenv('S3_BUCKET_VIDEO');
$app['accessKey'] = getenv('S3_KEY');
$app['secretKey'] = getenv('S3_SECRET');
$app['hostBase'] = getenv('S3_HOST');
$app['hostBucket'] = getenv('S3_HOST');

$app['base_url'] = getenv('S3_BASE_URL');
$app['cacheDir'] = '/code/var/cache/labeling_api';

$app['ffmpeg_executable'] = 'avconv';

$app['azureCmdExecutable'] = getenv('AZURE_CMD_EXECUTABLE');
$app['azureDefaultEndpointsProtocol'] = getenv('AZURE_DEFAULT_ENDPOINTS_PROTOCOL');
$app['azureAccountName'] = getenv('AZURE_ACCOUNT_NAME');
$app['azureContainer'] = getenv('AZURE_CONTAINER');
$app['azureDirVideo'] = getenv('AZURE_DIR_VIDEO');
$app['azureDirFrame'] = getenv('AZURE_DIR_FRAME');
$app['azureAccountKey'] = getenv('AZURE_ACCOUNT_KEY');
$app['azureBlobEndpoint'] = getenv('AZURE_BLOB_ENDPOINT');

$app['storage_type'] = getenv('STORAGE_TYPE');