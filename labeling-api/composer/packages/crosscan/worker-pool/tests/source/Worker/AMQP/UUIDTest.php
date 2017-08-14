<?php
namespace crosscan\WorkerPool\AMQP;

use crosscan\WorkerPool\AMQP;
use crosscan\WorkerPool;
use crosscan\Std;
use Phake as p;
use PhpAmqpLib\Channel;
use PhpAmqpLib\Message;

class UUIDTest extends Base
{
    public function testUuidIsBeingAdded()
    {
        $firstMessage  = "Hallo Welt";

        $pool          = new AMQP\FacadeAMQP($this->config, $this->loggerMock);
        $job1          = new WorkerPool\Job\TestJob();
        $job1->message = $firstMessage;
        $this->assertFalse($job1->hasUuid());
        $pool->addJob($job1);

        $this->runWorkerPool('worker.queue.normal_prio', 'worker.queue.high_prio', 1);

        $this->assertTrue($job1->hasUuid());

        unlink($job1->filename);
    }

    /**
     * Verify that preconditions do not have their own uuids, but instead still have the uuid of the original job.
     */
    public function testPreconditionUUID()
    {
        $innerJob = new WorkerPool\Job\TestJob();
        $outerJob = new WorkerPool\Test\Helper\EmptyPrecondition($innerJob);

        $this->assertFalse($outerJob->hasUuid());
        $this->assertFalse($innerJob->hasUuid());

        $outerJob->setUuid(new Std\UUID());

        $this->assertTrue($outerJob->hasUuid());
        $this->assertTrue($innerJob->hasUuid());

        $this->assertSame($outerJob->getUuid(), $innerJob->getUuid());
    }

    /**
     * Verify that old jobs, which have been created before the uuid-field was introduced, can still be deserialized :)
     */
    public function testDeserializationOfJobWithoutUUID()
    {

        $serializer = new WorkerPool\Serializer\PhpSerialize();

        /*** @var \crosscan\WorkerPool\Job\TestJob $job */
        $job = $serializer->unserialize(file_get_contents(__DIR__ . '/data/testjob.serialized.txt'));
        $this->assertEquals(
            'Hallo Welt',
            $job->message
        );

        $this->assertFalse($job->hasUuid());
    }
}
