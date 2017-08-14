<?php

namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool\AMQP;
use crosscan\WorkerPool;
use Phake as p;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;

class AMQPTest extends Base
{
    public function testJobDelivery()
    {
        $firstMessage  = "Hallo Welt";
        $secondMessage = "Hallo crosscan";

        $pool          = new AMQP\FacadeAMQP($this->config, $this->loggerMock);
        $job1          = new WorkerPool\Job\TestJob();
        $job1->message = $firstMessage;
        $pool->addJob($job1);
        $job2          = new WorkerPool\Job\TestJob();
        $job2->message = $secondMessage;
        $pool->addJob($job2, WorkerPool\Facade::HIGH_PRIO);

        $this->runWorkerPool('worker.queue.normal_prio', 'worker.queue.high_prio', 2);

        $this->assertSame($firstMessage, file_get_contents($job1->filename));
        $this->assertSame($secondMessage, file_get_contents($job2->filename));

        unlink($job1->filename);
        unlink($job2->filename);
    }

    public function testGarbageQueue()
    {
        $redeliverableJob = new WorkerPool\Job\Impossibruuuu(true);
        $unrecoverableJob = new WorkerPool\Job\Impossibruuuu(false);
        $pool             = new AMQP\FacadeAMQP($this->config, $this->loggerMock);

        $garbageSource = new JobSourceAMQP(
            'worker.garbage-collection',
            'worker.garbage-collection',
            $this->config->openConnection()->channel()
        );

        $pool->addJob($redeliverableJob);
        $pool->addJob($unrecoverableJob);

        $this->runWorkerPool('worker.queue.normal_prio', 'worker.queue.normal_prio', 2);

        $garbageMessage = $garbageSource->getNext();
        $garbageMessage->ack();
        /** @var WorkerPool\Job\Impossibruuuu $garbageJob */
        $garbageJob = $garbageMessage->getJob();

        $this->assertFalse($garbageJob->job->isRecoverable());

        $redeliverQueue = new AMQP\JobSourceAMQP(
            'worker.reschedule.30s',
            'worker.reschedule.30s',
            $this->config->openConnection()->channel()
        );

        $redeliveredMessage = $redeliverQueue->getNext();
        $redeliveredMessage->ack();

        $redeliveredJob = $redeliveredMessage->getJob()->job;

        $this->assertTrue($redeliveredJob->isRecoverable());
    }

    public function testUnserializableMessage()
    {
        $channel        = $this->config->openConnection()->channel();
        $unserializable = 'O:43:"crosscan\Connect\Worker\Job\NewLicensePlate":14:{s:52:"crosscan\Connect\Worker\Job\NewLicensePlatestoreId";s:4:"2431";s:53:"crosscan\Connect\Worker\Job\NewLicensePlatecameraId";i:0;s:55:"crosscan\Connect\Worker\Job\NewLicensePlatecameraName";s:0:"";s:57:"crosscan\Connect\Worker\Job\NewLicensePlatelicensePlate";s:7:"R0530AE";s:53:"crosscan\Connect\Worker\Job\NewLicensePlateprovince";s:15:"Oberösterreich";s:49:"crosscan\Connect\Worker\Job\NewLicensePlatecity";s:8:"Rohrbach";s:54:"crosscan\Connect\Worker\Job\NewLicensePlatecityShort";s:2:"RO";s:49:"crosscan\Connect\Worker\Job\NewLicensePlatetime";i:1452157345;s:8:"priority";s:6:"normal";s:9:"createdAt";N;s:17:"originallyCreated";O:8:"DateTime":0:{}s:16:"discardOnTimeout";b:0;s:3:"ttl";i:259200;s:19:"numberOfReschedules";i:0;}';
        $message        = new Message\AMQPMessage($unserializable);
        $channel->basic_publish($message, '', 'worker.queue.normal_prio');
        $this->runWorkerPool('worker.queue.normal_prio', 'worker.queue.normal_prio', 1);

        /*** @var \PhpAmqpLib\Message\AMQPMessage $message */
        $garbageQueueMessage = $channel->basic_get('worker.garbage-collection');
        $this->assertSame($unserializable, $message->body);
        $this->assertNull($channel->basic_get('worker.garbage-collection'));
    }

}
