<?php

$config = new \crosscan\WorkerPool\AMQP\AMQPPoolConfig();

$config->numberOfHighNormalWorkers                               = 8;
$config->numberOfLowNormalWorkers                                = 2;
$config->host                                                    = '127.0.0.1';
$config->port                                                    = 5672;
$config->vhost                                                   = '/';
$config->username                                                = 'guest';
$config->password                                                = 'guest';
$config->instructionInstances['crosscan\WorkerPool\Job\TestJob'] = '\crosscan\WorkerPool\Instruction\TestJobOutputter';
$config->useDeadLetterExchange                                   = true;
$config->useAlternateExchange                                    = true;

return $config;
