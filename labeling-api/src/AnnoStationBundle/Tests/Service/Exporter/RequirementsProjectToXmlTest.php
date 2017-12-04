<?php

namespace AnnoStationBundle\Tests\Service\Exporter;

use AppBundle\Model as AppBundleModel;
use AppBundle\Model\Shapes;
use AppBundle\Service;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use AnnoStationBundle\Service\Exporter;
use AnnoStationBundle\Tests;

class RequirementsProjectToXmlTest extends Tests\CouchDbTestCase
{
    /**
     * @var Exporter\RequirementsProjectToXml
     */
    private $exporter;

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * @var Service\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    public function testXmlExport()
    {
        $labelManagerUser = $this->createLabelManagerUser();
        $date             = new \DateTime('2017-01-20 16:00:00', new \DateTimeZone('UTC'));
        $organisation     = $this->createOrganisation();
        $project          = $this->getProject($organisation, $labelManagerUser, $date);

        $export = $this->exporterFacade->save(
            new AppBundleModel\Export($project, $labelManagerUser, $date)
        );

        $this->exporter->export($export);

        $attachments = $export->getAttachments();

        $content = $this->removeIdValues(
            $this->getContentFromZip(reset($attachments)->getRawData(), 'labeling-video.xml')
        );

        $this->assertEquals(file_get_contents(__DIR__ . '/Expected/Requirements.xml'), $content);
    }

    public function testXmlExportWithPreviousConfigurationFile()
    {
        $labelManagerUser = $this->createLabelManagerUser();
        $date             = new \DateTime('2017-01-20 16:00:00', new \DateTimeZone('UTC'));
        $organisation     = $this->createOrganisation();
        $project          = $this->getProject($organisation, $labelManagerUser, $date, true);

        $export = $this->exporterFacade->save(
            new AppBundleModel\Export($project, $labelManagerUser, $date)
        );

        $this->exporter->export($export);

        $attachments = $export->getAttachments();

        $this->assertEquals(
            $this->getContentFromZip(reset($attachments)->getRawData(), 'testconfig.labelconfiguration.xml'),
            file_get_contents(__DIR__ . '/TaskConfiguration/Requirements.xml')
        );
        $this->assertEquals(
            $this->getContentFromZip(reset($attachments)->getRawData(), 'previoustestconfig.labelconfiguration_old.xml'),
            file_get_contents(__DIR__ . '/TaskConfiguration/PreviousRequirements.xml')
        );
    }

    private function getProject($organisation, $labelManagerUser, $date, $withPreviousTaskConfiguration = false)
    {
        $project              = $this->createProject('project-id-1', $organisation, $labelManagerUser, $date);
        $project->addAdditionalFrameNumberMapping($this->createAdditionalFrameNumberMapping($organisation));
        $this->projectFacade->save($project);
        $video = $this->createVideoWithCalibration($organisation);
        $video->setOriginalId('e363906c1c4a5a5bd01e8902467d4b0e');
        $this->videoFacade->save($video);

        $taskConfiguration         = $this->createTaskConfiguration(
            file_get_contents(__DIR__ . '/TaskConfiguration/Requirements.xml'),
            $this->createOrganisation(),
            $labelManagerUser,
            'testconfig',
            'testconfig.xml',
            'application/xml',
            'requirementsXml'
        );
        $previousTaskConfiguration = null;
        if ($withPreviousTaskConfiguration) {
            $previousTaskConfiguration = $this->createTaskConfiguration(
                file_get_contents(__DIR__ . '/TaskConfiguration/PreviousRequirements.xml'),
                $this->createOrganisation(),
                $labelManagerUser,
                'previoustestconfig',
                'previoustestconfig.xml',
                'application/xml',
                'requirementsXml'
            );
        }

        $task = $this->createTask(
            $project,
            $video,
            $taskConfiguration,
            null,
            AppBundleModel\LabelingTask::TYPE_OBJECT_LABELING,
            $previousTaskConfiguration
        );
        $this->createShapes($task);
        $this->createLabeledFrames($task);

        return $project;
    }

    private function removeIdValues($content)
    {
        $document = new \DOMDocument();
        $document->loadXML($content);

        $xpath = new \DOMXPath($document);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/export");
        $hostname = $xpath->query('/x:export/x:metadata/x:annostation/x:hostname');
        $hostname->item(0)->nodeValue = '';
        $projectId = $xpath->query('/x:export/x:metadata/x:project[@id]');
        $projectId->item(0)->setAttribute('id', '');
        $exportId = $xpath->query('/x:export/x:metadata/x:export[@id]');
        $exportId->item(0)->setAttribute('id', '');
        $requirementsId = $xpath->query('/x:export/x:metadata/x:requirements[@id]');
        $requirementsId->item(0)->setAttribute('id', '');
        $additionalFrameNumberMappingId = $xpath->query('/x:export/x:metadata/x:additional-frame-number-mapping[@id]');
        $additionalFrameNumberMappingId->item(0)->setAttribute('id', '');
        $groupIds = $xpath->query('/x:export/x:video/x:group[@id]');
        foreach ($groupIds as $groupId) {
            $groupId->setAttribute('id', '');
        }
        $thingTaskIds = $xpath->query('/x:export/x:video/x:thing/x:references/x:task[@id]');
        foreach ($thingTaskIds as $thingTaskId) {
            $thingTaskId->setAttribute('id', '');
        }
        $frameTaskIds = $xpath->query('/x:export/x:video/x:frame-labeling/x:references/x:task[@id]');
        foreach ($frameTaskIds as $frameTaskId) {
            $frameTaskId->setAttribute('id', '');
        }
        $groupIds = $xpath->query('/x:export/x:video/x:thing/x:references/x:group[@ref]');
        foreach ($groupIds as $groupId) {
            $groupId->setAttribute('ref', '');
        }

        return $document->saveXML();

    }

    private function getDocumentManagerForTask(AppBundleModel\LabelingTask $task)
    {
        return $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $this->taskDatabaseCreatorService->getDatabaseName(
                $task->getProjectId(),
                $task->getId()
            )
        );
    }

    private function createLabeledFrames(AppBundleModel\LabelingTask $task)
    {
        $databaseDocumentManager = $this->getDocumentManagerForTask($task);
        $this->labeledFrameFacade = new Facade\LabeledFrame($databaseDocumentManager);

        $labeledFrame = Tests\Helper\LabeledFrameBuilder::create($task, 0)
            ->withClasses(['sun', 'summer'])
            ->build();
        $this->labeledFrameFacade->save($labeledFrame);

        $labeledFrame = Tests\Helper\LabeledFrameBuilder::create($task, 25)
            ->withClasses(['rain', 'summer'])
            ->withIncompleteFlag(true)
            ->build();
        $this->labeledFrameFacade->save($labeledFrame);

        $labeledFrame = Tests\Helper\LabeledFrameBuilder::create($task, 50)
            ->withClasses(['thunderstorm', 'summer'])
            ->build();
        $this->labeledFrameFacade->save($labeledFrame);

        $labeledFrame = Tests\Helper\LabeledFrameBuilder::create($task, 75)
            ->withClasses(['sun', 'summer'])
            ->build();
        $this->labeledFrameFacade->save($labeledFrame);
    }

    private function createShapes(AppBundleModel\LabelingTask $task)
    {
        $databaseDocumentManager              = $this->getDocumentManagerForTask($task);
        $this->labeledThingGroupFacade        = new Facade\LabeledThingGroup($databaseDocumentManager);
        $this->labeledThingGroupInFrameFacade = new Facade\LabeledThingGroupInFrame($databaseDocumentManager);
        $this->labeledThingFacade             = new Facade\LabeledThing($databaseDocumentManager);
        $this->labeledThingInFrameFacade      = new Facade\LabeledThingInFrame($databaseDocumentManager);

        $labeledThing = $this->createLabeledThing($task);
        $labeledThing->setOriginalId('e363906c1c4a5a5bd01e8902467d1426');
        $this->labeledThingFacade->save($labeledThing);

        $cuboid1      = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [10, 1, 1],
            [10, -1, 1],
            [10, -1, 0],
            [10, 1, 0],
            [11, 1, 1],
            [11, -1, 1],
            [11, -1, 0],
            [11, 1, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 1, [$cuboid1->toArray()], ['u-turn', 'germany'], null, 'sign');
        $cuboid2 = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [10, 1, 1],
            [10, -1, 1],
            [10, -1, 0],
            [10, 1, 0],
            [11, 1, 1],
            [11, -1, 1],
            [11, -1, 0],
            [11, 1, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 2, [$cuboid2->toArray()], ['u-turn', 'germany'], null, 'sign');
        $cuboid3 = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [10, 1, 1],
            [10, -1, 1],
            [10, -1, 0],
            [10, 1, 0],
            [11, 1, 1],
            [11, -1, 1],
            [11, -1, 0],
            [11, 1, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 3, [$cuboid3->toArray()], ['u-turn', 'spain'], null, 'sign');
        $cuboid4 = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [10, 1, 1],
            [10, -1, 1],
            [10, -1, 0],
            [10, 1, 0],
            [11, 1, 1],
            [11, -1, 1],
            [11, -1, 0],
            [11, 1, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 4, [$cuboid4->toArray()], ['u-turn', 'spain'], null, 'sign');
        $cuboid5 = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [11.034211898729, 1.0709619782734, 1],
            [11.034211898729, -0.92903802172656, 1],
            [11.034211898729, -0.92903802172656, 0],
            [11.034211898729, 1.0709619782734, 0],
            [12.034211898729, 1.0709619782734, 1],
            [12.034211898729, -0.92903802172656, 1],
            [12.034211898729, -0.92903802172656, 0],
            [12.034211898729, 1.0709619782734, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 5, [$cuboid5->toArray()], ['u-turn', 'spain'], null, 'sign');
        $cuboid11 = new Shapes\Cuboid3d(
            '3659ecca-7c2b-440b-8dfa-38426c7969b6',
            [11.034211898729, 1.0709619782734, 1],
            [11.034211898729, -0.92903802172656, 1],
            [11.034211898729, -0.92903802172656, 0],
            [11.034211898729, 1.0709619782734, 0],
            [12.034211898729, 1.0709619782734, 1],
            [12.034211898729, -0.92903802172656, 1],
            [12.034211898729, -0.92903802172656, 0],
            [12.034211898729, 1.0709619782734, 0]
        );
        $this->createLabeledThingInFrame($labeledThing, 11, [$cuboid5->toArray()], ['u-turn', 'germany'], null, 'sign');

        $labeledThingGroup1 = Tests\Helper\LabeledThingGroupBuilder::create($task)
            ->withIdentifierName('extension-sign-group')
            ->withCreatedByUserId('some-user-foobar-123-id')
            ->withLastModifiedUserId('some-user-foobar-789-id')
            ->build();
        $labeledThingGroup2 = Tests\Helper\LabeledThingGroupBuilder::create($task)
            ->withIdentifierName('lights-group')
            ->withCreatedByUserId('some-user-foobar-123-id')
            ->withLastModifiedUserId('some-user-foobar-789-id')
            ->build();
        $this->labeledThingGroupFacade->save($labeledThingGroup1);
        $this->labeledThingGroupFacade->save($labeledThingGroup2);

        $labeledThingGroupInFrame1 = Tests\Helper\LabeledThingGroupInFrameBuilder::create($task, $labeledThingGroup1, 1)->withClasses(['position-below'])->build();
        $this->labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame1);
        $labeledThingGroupInFrame2 = Tests\Helper\LabeledThingGroupInFrameBuilder::create($task, $labeledThingGroup2, 10)->withClasses(['red'])->build();
        $this->labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame2);
        $labeledThingGroupInFrame3 = Tests\Helper\LabeledThingGroupInFrameBuilder::create($task, $labeledThingGroup2, 15)->withClasses(['blue'])->build();
        $this->labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame3);

        $labeledThingWithGroup1 = $this->createLabeledThing($task);
        $labeledThingWithGroup1->setOriginalId('e363906c1c4a5a5bd01e890246819813');
        $labeledThingWithGroup1->setFrameRange(new AppBundleModel\FrameIndexRange(0, 0));
        $labeledThingWithGroup1->setGroupIds([$labeledThingGroup1->getId(), $labeledThingGroup2->getId()]);
        $this->labeledThingFacade->save($labeledThingWithGroup1);
        $rectangle1 = new Shapes\Rectangle('3659ecca-7c2b-440b-8dfa-38426c7969b7', 1, 2, 3, 4);
        $this->createLabeledThingInFrame($labeledThingWithGroup1, 0, [$rectangle1->toArray()], ['u-turn', 'spain'], null, 'time-range-sign');

        $labeledThingWithGroup2 = $this->createLabeledThing($task);
        $labeledThingWithGroup2->setOriginalId('e363906c1c4a5a5bd01e89024681a191');
        $labeledThingWithGroup2->setFrameRange(new AppBundleModel\FrameIndexRange(0, 20));
        $labeledThingWithGroup2->setGroupIds([$labeledThingGroup1->getId(), $labeledThingGroup2->getId()]);
        $this->labeledThingFacade->save($labeledThingWithGroup2);
        foreach(range(1,20) as $frameIndex) {
            $rectangle2 = new Shapes\Rectangle('3659ecca-7c2b-440b-8dfa-38426c7969b7', 1, 2, 3, 4);
            $this->createLabeledThingInFrame($labeledThingWithGroup2, $frameIndex, [$rectangle2->toArray()], ['u-turn', 'spain'], null, 'time-range-sign');
        }

        $polygonLabeledThing = $this->createLabeledThing($task);
        $polygonLabeledThing->setOriginalId('e363906c1c4a5a5bd01e89024681abcd');
        $polygonLabeledThing->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($polygonLabeledThing);
        $polygon = new Shapes\Polygon(
            '3659ecca-7c2b-440b-8dfa-38426c79abcd',
            [
                ['x' => 100, 'y' => 100],
                ['x' => 200, 'y' => 200]
            ]
        );
        $this->createLabeledThingInFrame($polygonLabeledThing, 1, [$polygon->toArray()], ['lane-yes'], null, 'lane');

        $polylineLabeledThing = $this->createLabeledThing($task);
        $polylineLabeledThing->setOriginalId('e363906c1c4a5a5bd01e89024681abce');
        $polylineLabeledThing->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($polylineLabeledThing);
        $polyline = new Shapes\Polyline(
            '3659ecca-7c2b-440b-8dfa-38426c79abce',
            [
                ['x' => 135, 'y' => 235],
                ['x' => 631, 'y' => 835]
            ]
        );
        $this->createLabeledThingInFrame($polylineLabeledThing, 1, [$polyline->toArray()], ['lane-open-no'], null, 'lane-open');

        $pointLabeledThing = $this->createLabeledThing($task);
        $pointLabeledThing->setOriginalId('e363906c1c4a5a5bd01e89024681abcf');
        $pointLabeledThing->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($pointLabeledThing);
        $point = new Shapes\Point(
            '3659ecca-7c2b-440b-8dfa-38426c79abcf',
            ['x' => 624, 'y' => 321]
        );
        $this->createLabeledThingInFrame($pointLabeledThing, 1, [$point->toArray()], ['lightsource-yes'], null, 'light');

        $pedestrianLabeledThing = $this->createLabeledThing($task);
        $pedestrianLabeledThing->setOriginalId('e363906c1c4a5a5bd01easdasdasdasdasd');
        $pedestrianLabeledThing->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($pedestrianLabeledThing);
        $pedestrian = new Shapes\pedestrian(
            '3659ecca-7c2b-440b-8dfa-38426cyxcyxc',
            100, 0, 100, 347
        );
        $this->createLabeledThingInFrame($pedestrianLabeledThing, 1, [$pedestrian->toArray()], ['hat-yes'], null, 'person');

        $labeledThingWithDefaultValues = $this->createLabeledThing($task);
        $labeledThingWithDefaultValues->setOriginalId('e363906c1c4a5a5bd01easdas-default');
        $labeledThingWithDefaultValues->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($labeledThingWithDefaultValues);
        $shape = new Shapes\pedestrian(
            '3659ecca-7c2b-440b-8dfa-38426cy-default',
            100, 0, 100, 347
        );
        $this->createLabeledThingInFrame(
            $labeledThingWithDefaultValues,
            1,
            [$shape->toArray()],
            ['default-test-value-a-1', 'default-test-value-b-2-2-1'],
            null,
            'default-test'
        );
    }

    private function getContentFromZip($data, $filename)
    {
        $tempZipFile = \tempnam(sys_get_temp_dir(), 'test_generic_export_zip');
        file_put_contents($tempZipFile, $data);
        $zip = new \ZipArchive;
        $zip->open($tempZipFile);
        $zip->extractTo(sys_get_temp_dir(), [$filename]);
        $zip->close();

        $content = file_get_contents(sys_get_temp_dir() . '/' . $filename);
        unlink(sys_get_temp_dir() . '/' . $filename);

        return $content;
    }

    private function createAdditionalFrameNumberMapping(Model\Organisation $organisation)
    {
        /** @var Facade\AdditionalFrameNumberMapping $additionalFrameNumberMappingFacade */
        $additionalFrameNumberMappingFacade = $this->getAnnostationService(
            'database.facade.additional_frame_number_mapping'
        );
        $additionalFrameNumberMapping       = new Model\AdditionalFrameNumberMapping($organisation);
        $additionalFrameNumberMapping->addAttachment(
            'labeling-video.frame-index.csv',
            file_get_contents(__DIR__ . '/../VideoImporterFixtures/labeling-video.frame-index.csv'),
            mime_content_type(__DIR__ . '/../VideoImporterFixtures/labeling-video.frame-index.csv')
        );

        return $additionalFrameNumberMappingFacade->save($additionalFrameNumberMapping);
    }

    private function createVideoWithCalibration(Model\Organisation $organisation)
    {
        $calibrationFileConverter = $this->getAnnostationService('service.calibration_file_converter');
        $calibrationDataFacade    = $this->getAnnostationService('database.facade.calibration_data');

        $calibrationFileConverter->setCalibrationData(__DIR__ . '/Calibration/Video.csv');

        $video = AppBundleModel\Video::create($organisation, 'labeling-video');

        $videoMetadata = new AppBundleModel\Video\MetaData();
        $videoMetadata->width = 1000;
        $videoMetadata->height = 800;
        $video->setMetaData($videoMetadata);

        $calibrationData = new AppBundleModel\CalibrationData($this->createOrganisation(), 'test_video');
        $calibrationData->setRawCalibration($calibrationFileConverter->getRawData());
        $calibrationData->setCameraMatrix($calibrationFileConverter->getCameraMatrix());
        $calibrationData->setRotationMatrix($calibrationFileConverter->getRotationMatrix());
        $calibrationData->setTranslation($calibrationFileConverter->getTranslation());
        $calibrationData->setDistortionCoefficients($calibrationFileConverter->getDistortionCoefficients());
        $calibrationDataFacade->save($calibrationData);
        $video->setCalibrationId($calibrationData->getId());

        return $this->videoFacade->save($video);
    }

    protected function setUpImplementation()
    {
        $this->exporter                       = $this->getAnnostationService(
            'service.exporter.requirements_project_to_xml'
        );
        $this->exporterFacade                 = $this->getAnnostationService('database.facade.exporter');
        $this->databaseDocumentManagerFactory = $this->getService(
            'annostation.services.database_document_manager_factory'
        );

        parent::setUpImplementation();
    }
}
