<?php

$config = new \crosscan\WorkerPool\AMQP\AMQPPoolConfig();

$config->numberOfHighNormalWorkers                                     = 1;
$config->numberOfLowNormalWorkers                                      = 0;
$config->host                                                          = '127.0.0.1';
$config->port                                                          = 5672;
$config->vhost                                                         = null;
$config->username                                                      = 'guest';
$config->password                                                      = 'guest';
$config->instructionInstances['crosscan\WorkerPool\Job\TestJob']       = '\crosscan\WorkerPool\Instruction\TestJobOutputter';
$config->instructionInstances['crosscan\WorkerPool\Job\Impossibruuuu'] = '\crosscan\WorkerPool\Instruction\TestJobOutputter';
$config->useDeadLetterExchange                                         = true;
$config->useAlternateExchange                                          = true;

return $config;
