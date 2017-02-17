<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\Tests;
use AnnoStationBundle\Worker\JobInstruction;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;
use AnnoStationBundle\Tests\Helper;

class VideoImporterTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    /**
     * @var JobInstruction\VideoFrameSplitter
     */
    private $videoFrameSplitterInstruction;

    public function setUpImplementation()
    {
        $this->workerPoolFacade = $this->getMockBuilder(WorkerPool\Facade::class)
            ->getMock();

        $cacheFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/cache');
        $cacheFilesystem        = new \League\Flysystem\Filesystem($cacheFilesystemAdapter);

        $frameCdnFilesystemAdapter = new \League\Flysystem\Adapter\Local('/tmp/labeling-api-test/frameCdn');
        $frameCdnFilesystem        = new \League\Flysystem\Filesystem($frameCdnFilesystemAdapter);

        $this->getContainer()->set(
            sprintf(self::ANNOSTATION_SERVICE_PATTERN, 'vendor.worker_pool.amqp'),
            $this->workerPoolFacade
        );

        $this->getContainer()->set('oneup_flysystem.cache_filesystem', $cacheFilesystem);
        $this->getContainer()->set('oneup_flysystem.frame_cdn_filesystem', $frameCdnFilesystem);

        $this->videoFacade                   = $this->getAnnostationService('database.facade.video');
        $this->projectFacade                 = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade            = $this->getAnnostationService('database.facade.labeling_task');
        $this->videoImporterService          = $this->getAnnostationService('service.video_importer');
        $this->videoFrameSplitterInstruction = $this->getAnnostationService('worker.job_instruction.video');
    }

    public function tearDownImplementation()
    {
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForTheWholeVideoPerDefault()
    {
        $tasks = $this->importVideo(0, null, array('foo' => 'bar'));

        $this->assertCount(2, $tasks);

        $videoId = $tasks[0]->getVideoId();
        $this->assertEquals($videoId, $tasks[1]->getVideoId());

        $this->assertEquals(Model\LabelingTask::TYPE_META_LABELING, $tasks[0]->getTaskType());
        $this->assertEquals(Model\LabelingTask::TYPE_OBJECT_LABELING, $tasks[1]->getTaskType());
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForEachChunk()
    {
        $tasks = $this->importVideo($chunkSizeInSeconds = 3, null, array('foo' => 'bar'));
        $this->assertCount(4, $tasks);
        $this->assertEquals(array_combine(range(0, 74), range(1, 75)), $tasks[0]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 74), range(1, 75)), $tasks[1]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 56), range(76, 132)), $tasks[2]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 56), range(76, 132)), $tasks[3]->getFrameNumberMapping());
    }

    public function testVideoImporterCreatesMetaAndObjectLabelingTasksForEachChunkWithRoundedFrameIndexPerChunk()
    {
        $tasks = $this->importVideo($chunkSizeInSeconds = 1.23, null, array('foo' => 'bar'));
        $this->assertCount(10, $tasks);
        $this->assertEquals(array_combine(range(0, 30), range(1, 31)), $tasks[0]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(1, 31)), $tasks[1]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(32, 62)), $tasks[2]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(32, 62)), $tasks[3]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(63, 93)), $tasks[4]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(63, 93)), $tasks[5]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(94, 124)), $tasks[6]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 30), range(94, 124)), $tasks[7]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 7), range(125, 132)), $tasks[8]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 7), range(125, 132)), $tasks[9]->getFrameNumberMapping());
    }

    public function testVideoImporterProperlySetsMinimalVisibleShapeOverflow()
    {
        $tasks = $this->importVideo(0, 16, array('foo' => 'bar'));

        $this->assertEquals(2, count($tasks));

        $this->assertEquals('meta-labeling', $tasks[0]->getTaskType());
        $this->assertEquals(null, $tasks[0]->getMinimalVisibleShapeOverflow());

        $this->assertEquals('object-labeling', $tasks[1]->getTaskType());
        $this->assertEquals(16, $tasks[1]->getMinimalVisibleShapeOverflow());
    }

    public function testVideoImporterUsesFrameStepSizeCorrectly()
    {
        $tasks = $this->importVideo(
            $chunkSizeInSeconds = 1.23,
            null,
            array('foo' => 'bar'),
            $frameStepSize = 2
        );
        $this->assertCount(10, $tasks);
        $this->assertEquals(array_combine(range(0, 15), range(1, 31, 2)), $tasks[0]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(1, 31, 2)), $tasks[1]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(33, 63, 2)), $tasks[2]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(33, 63, 2)), $tasks[3]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(65, 95, 2)), $tasks[4]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(65, 95, 2)), $tasks[5]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(97, 127, 2)), $tasks[6]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(97, 127, 2)), $tasks[7]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 1), range(129, 131, 2)), $tasks[8]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 1), range(129, 131, 2)), $tasks[9]->getFrameNumberMapping());
    }

    public function testVideoImporterUsesFrameStepSizeAndFrameSkipCorrectly()
    {
        $tasks = $this->importVideo(
            $chunkSizeInSeconds = 1.23,
            null,
            array('foo' => 'bar'),
            $frameStepSize = 2,
            $startFrameNumber = 5
        );
        $this->assertCount(8, $tasks);
        $this->assertEquals(array_combine(range(0, 15), range(5, 35, 2)), $tasks[0]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(5, 35, 2)), $tasks[1]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(37, 67, 2)), $tasks[2]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(37, 67, 2)), $tasks[3]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(69, 99, 2)), $tasks[4]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(69, 99, 2)), $tasks[5]->getFrameNumberMapping());

        $this->assertEquals(array_combine(range(0, 15), range(101, 131, 2)), $tasks[6]->getFrameNumberMapping());
        $this->assertEquals(array_combine(range(0, 15), range(101, 131, 2)), $tasks[7]->getFrameNumberMapping());
    }

    private function importVideo(
        $chunkSizeInSeconds = 0,
        $minimalVisibleShapeOverflow = null,
        $drawingToolOptions = array(),
        $frameStepSize = 1,
        $startFrameNumber = 1
    ) {
        $jobs = [];
        $this->workerPoolFacade->expects($this->any())->method('addJob')->with(
            $this->callback(
                function ($job) use (&$jobs) {
                    if ($job instanceof Jobs\VideoFrameSplitter) {
                        $jobs[] = $job;

                        return true;
                    }

                    return false;
                }
            )
        );

        $organisation = Helper\OrganisationBuilder::create()->build();
        $tasks = $this->videoImporterService->import(
            $organisation,
            'testVideo',
            'testProject',
            $this->getTestVideoPath(),
            null,
            true,
            true,
            array(
                array(
                    'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                    'drawingTool' => 'rectangle',
                    'taskConfiguration' => null,
                )
            ),
            false,
            $chunkSizeInSeconds,
            $minimalVisibleShapeOverflow,
            $drawingToolOptions,
            $frameStepSize,
            $startFrameNumber
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
        return __DIR__ . '/../../Resources/SampleVideo_320x180.mp4';
    }
}
