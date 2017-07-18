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

    private function createVideoImporterService(array $mockedMethods = []): Service\VideoImporter
    {
        $calibrationDataFacade    = $this->getAnnostationService('database.facade.calibration_data');
        $metaDataReader           = $this->getAnnostationService('service.video.meta_data_reader');
        $videoFrameSplitter       = $this->getAnnostationService('service.video.video_frame_splitter');
        $labelStructureService    = $this->getAnnostationService('service.label_structure');
        $calibrationFileConverter = $this->getAnnostationService('service.calibration_file_converter');
        $taskConfigurationFacade  = $this->getAnnostationService('database.facade.task_configuration');

        $videoImporterMock = $this->getMockBuilder(Service\VideoImporter::class)
            ->enableProxyingToOriginalMethods()
            ->setConstructorArgs(
                [
                    $this->projectFacade,
                    $this->videoFacade,
                    $calibrationDataFacade,
                    $this->labelingTaskFacade,
                    $metaDataReader,
                    $videoFrameSplitter,
                    $labelStructureService,
                    $this->workerPoolFacade,
                    $calibrationFileConverter,
                    $taskConfigurationFacade,
                ]
            )
            ->setMethods($mockedMethods)
            ->getMock();

        return $videoImporterMock;
    }

    public function tearDownImplementation()
    {
    }

    public function testVideoImportCreatesExpectedVideoModel()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $this->assertEquals($videoFilename, $video->getName());
        $this->assertInstanceOf(MetaData::class, $video->getMetaData());
        $this->assertEquals(null, $video->getCalibrationId());
        $this->assertEquals(null, $video->getOriginalId());
    }

    public function testVideoWithCorrectImageTypesForLosslessIsCreated()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $expectedImageTypes = [
            'source'    => ['converted' => false],
            'thumbnail' => ['converted' => false],
        ];
        $this->assertEquals($expectedImageTypes, $video->getImageTypes());
    }

    public function testVideoWithCorrectImageTypesForNonLosslessIsCreated()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            false
        );

        $expectedImageTypes = [
            'sourceJpg' => ['converted' => false],
            'thumbnail' => ['converted' => false],
        ];
        $this->assertEquals($expectedImageTypes, $video->getImageTypes());
    }

    public function testProjectDiskUsageIsUpdated()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $fileSize = filesize($videoPath);

        $this->assertEquals($fileSize, $project->getDiskUsageInBytes());
    }

    public function testVideoIsAddedToProject()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $this->assertEquals(
            ['labeling-video' => $video->getId()],
            $project->getVideoIds()
        );
    }

    public function testConversionJobsForVideoAreAdded()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $calledWithJobs = [];
        $this->workerPoolFacade
            ->expects($this->exactly(2))
            ->method('addJob')
            ->with(
                $this->callback(
                    function ($job) use (&$calledWithJobs) {
                        $calledWithJobs[] = $job;

                        return true;
                    }
                )
            );

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $this->assertEquals($video->getId(), $calledWithJobs[0]->videoId);
        $this->assertEquals($video->getSourceVideoPath(), $calledWithJobs[0]->path);
        $this->assertEquals($video->getId(), $calledWithJobs[1]->videoId);
        $this->assertEquals($video->getSourceVideoPath(), $calledWithJobs[1]->path);
    }

    public function testConversionJobsForCompressedVideoAreAdded()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $calledWithJobs = [];
        $this->workerPoolFacade
            ->expects($this->exactly(2))
            ->method('addJob')
            ->with(
                $this->callback(
                    function ($job) use (&$calledWithJobs) {
                        $calledWithJobs[] = $job;

                        return true;
                    }
                )
            );

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            false
        );

        $this->assertInstanceOf(ImageType\SourceJpg::class, $calledWithJobs[0]->imageType);
        $this->assertInstanceOf(ImageType\Thumbnail::class, $calledWithJobs[1]->imageType);
    }

    public function testConversionJobsForUncompressedVideoAreAdded()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $videoPath     = $this->getTestVideoPath();
        $videoFilename = basename($videoPath);

        $calledWithJobs = [];
        $this->workerPoolFacade
            ->expects($this->exactly(2))
            ->method('addJob')
            ->with(
                $this->callback(
                    function ($job) use (&$calledWithJobs) {
                        $calledWithJobs[] = $job;

                        return true;
                    }
                )
            );

        $videoImporterService = $this->createVideoImporterService();
        $video                = $videoImporterService->importVideo(
            $organisation,
            $project,
            $videoFilename,
            $videoPath,
            true
        );

        $this->assertInstanceOf(ImageType\Source::class, $calledWithJobs[0]->imageType);
        $this->assertInstanceOf(ImageType\Thumbnail::class, $calledWithJobs[1]->imageType);
    }

    public function testImportImageUsagesImportVideo()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $imagePath     = $this->getCompressedTestImagePath();
        $imageFilename = basename($imagePath);

        $videoImporterService = $this->createVideoImporterService(['importVideo']);
        $videoImporterService
            ->expects($this->once())
            ->method('importVideo');

        $videoImporterService->importImage(
            $organisation,
            $project,
            $imageFilename,
            $imagePath
        );
    }

    public function testImportImageImportsUncompressedImagesLossless()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $imagePath     = $this->getUncompressedTestImagePath();
        $imageFilename = basename($imagePath);

        $videoImporterService = $this->createVideoImporterService(['importVideo']);
        $videoImporterService
            ->expects($this->once())
            ->method('importVideo')
            ->with(
                $this->equalTo($organisation),
                $this->equalTo($project),
                $this->equalTo($imageFilename),
                $this->equalTo($imagePath),
                $this->equalTo(true)
            );

        $videoImporterService->importImage(
            $organisation,
            $project,
            $imageFilename,
            $imagePath
        );
    }

    public function testImportImageImportsCommpressedImagesCompressed()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $project      = Helper\ProjectBuilder::create($organisation)->build();

        $imagePath     = $this->getCompressedTestImagePath();
        $imageFilename = basename($imagePath);

        $videoImporterService = $this->createVideoImporterService(['importVideo']);
        $videoImporterService
            ->expects($this->once())
            ->method('importVideo')
            ->with(
                $this->equalTo($organisation),
                $this->equalTo($project),
                $this->equalTo($imageFilename),
                $this->equalTo($imagePath),
                $this->equalTo(false)
            );

        $videoImporterService->importImage(
            $organisation,
            $project,
            $imageFilename,
            $imagePath
        );
    }

    private function getTestVideoPath()
    {
        return __DIR__ . '/VideoImporterFixtures/labeling-video.avi';
    }

    private function getUncompressedTestImagePath()
    {
        return __DIR__ . '/VideoImporterFixtures/4k-image.png';
    }

    private function getCompressedTestImagePath()
    {
        return __DIR__ . '/VideoImporterFixtures/4k-image.jpg';
    }
}
