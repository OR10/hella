<?php

require_once __DIR__ . '/../bootstrap.php';

$logger = new \cscntLogger();

$gelfPublisher = new \Gelf\Publisher(
    new \Gelf\Transport\UdpTransport('172.31.0.2')
);

$gelfWriter = new cscntLogGelfWriter($gelfPublisher);
$logger->options->writers['gelf'] = $gelfWriter;

$logger->options->routes[] = new cscntLogSeverityFilter(
    cscntLogPayload::SEVERITY_DEBUG,
    array('gelf')
);

$logPayload = new \cscntLogStringPayload(
    \cscntLogPayload::SEVERITY_DEBUG,
    \cscntLogFacility::CLI,
    'gelf-test',
    'Hello World!'
);

$logger->log($logPayload);

echo 'Test logoutput send.' . PHP_EOL;
echo 'cscntRequestId:' . $logger->getGroup() . PHP_EOL;
