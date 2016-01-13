<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Tests;
use AppBundle\Worker\JobInstruction;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool;

class VideoImporterTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\Interpolation
     */
    private $videoImporterService;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;

    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $videoFrameSplitter;

    /**
     * @var JobInstruction\VideoFrameSplitter
     */
    private $videoFrameSplitterInstruction;

    public function setUpImplementation()
    {
        $this->workerPoolFacade = $this->getMockBuilder(WorkerPool\Facade::class)
            ->getMock();

        $cacheFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/cache');
        $cacheFilesystem = new \League\Flysystem\Filesystem($cacheFilesystemAdapter);

        $frameCdnFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/frameCdn');
        $frameCdnFilesystem = new \League\Flysystem\Filesystem($frameCdnFilesystemAdapter);

        $this->getContainer()->set(
            sprintf(self::ANNOSTATION_SERVICE_PATTERN, 'vendor.worker_pool.amqp'),
            $this->workerPoolFacade
        );

        $this->getContainer()->set('oneup_flysystem.cache_filesystem', $cacheFilesystem);
        $this->getContainer()->set('oneup_flysystem.frame_cdn_filesystem', $frameCdnFilesystem);

        $this->videoFacade                   = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade            = $this->getAnnostationService('database.facade.labeling_task');
        $this->videoImporterService          = $this->getAnnostationService('service.video_importer');
        $this->videoFrameSplitterInstruction = $this->getAnnostationService('worker.job_instruction.video');
    }

    public function tearDownImplementation()
    {
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForTheWholeVideoPerDefault()
    {
        $tasks = $this->importVideo();

        $this->assertCount(2, $tasks);

        $videoId = $tasks[0]->getVideoId();
        $this->assertEquals($videoId, $tasks[1]->getVideoId());

        $this->assertEquals(Model\LabelingTask::TYPE_META_LABELING, $tasks[0]->getTaskType());
        $this->assertEquals(Model\LabelingTask::TYPE_OBJECT_LABELING, $tasks[1]->getTaskType());
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForEachChunk()
    {
        $tasks = $this->importVideo($chunkSizeInSeconds = 3);

        $this->assertCount(4, $tasks);
        $this->assertEquals(new Model\FrameRange( 1,  75), $tasks[0]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 1,  75), $tasks[1]->getFrameRange());
        $this->assertEquals(new Model\FrameRange(76, 132), $tasks[2]->getFrameRange());
        $this->assertEquals(new Model\FrameRange(76, 132), $tasks[3]->getFrameRange());
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForEachChunkWithRoundedFrameNumberPerChunk()
    {
        $tasks = $this->importVideo($chunkSizeInSeconds = 1.23);

        $this->assertCount(10, $tasks);
        $this->assertEquals(new Model\FrameRange(  1,  31), $tasks[0]->getFrameRange());
        $this->assertEquals(new Model\FrameRange(  1,  31), $tasks[1]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 32,  62), $tasks[2]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 32,  62), $tasks[3]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 63,  93), $tasks[4]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 63,  93), $tasks[5]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 94, 124), $tasks[6]->getFrameRange());
        $this->assertEquals(new Model\FrameRange( 94, 124), $tasks[7]->getFrameRange());
        $this->assertEquals(new Model\FrameRange(125, 132), $tasks[8]->getFrameRange());
        $this->assertEquals(new Model\FrameRange(125, 132), $tasks[9]->getFrameRange());
    }

    private function importVideo($chunkSizeInSeconds = 0)
    {
        $jobs = [];
        $this->workerPoolFacade->expects($this->any())->method('addJob')->with($this->callback(
            function($job) use (&$jobs) {
                if ($job instanceof Jobs\VideoFrameSplitter) {
                    $jobs[] = $job;
                    return true;
                }
                return false;
            }
        ));

        $tasks = $this->videoImporterService->import(
            'testVideo',
            $this->getTestVideoPath(),
            false,
            $chunkSizeInSeconds
        );

        // Currently, we expect on meta- and one object-labeling task per video.
        $this->assertCount(2, $jobs);

        $this->workerPoolFacade->expects($this->never())->method('addJob');

        $logger = $this->getMockBuilder(\crosscan\Logger\Facade\LoggerFacade::class)
            ->disableOriginalConstructor()
            ->getMock();

        // let's execute the jobs
        while (!empty($jobs)) {
            $this->videoFrameSplitterInstruction->run(array_shift($jobs), $logger);
        }

        return $tasks;
    }

    private function getTestVideoPath()
    {
        return $this->getBundlePath() . '/Resources/SampleVideo_320x180.mp4';
    }
}
