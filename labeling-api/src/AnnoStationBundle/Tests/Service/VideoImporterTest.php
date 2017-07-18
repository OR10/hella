<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Tests\Helper;
use AnnoStationBundle\Worker\JobInstruction;
use AppBundle\Model\Video\ImageType;
use AppBundle\Model\Video\MetaData;
use AppBundle\Tests;
use crosscan\WorkerPool;

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
        $this->videoFrameSplitterInstruction = $this->getAnnostationService('worker.job_instruction.video');
    }

}
