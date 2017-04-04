<?php

namespace AnnoStationBundle\Tests\Service\Exporter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;
use AppBundle\Model\Shapes;
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

    public function testXmlExport()
    {
        $clientUser           = $this->createClientUser();
        $date                 = new \DateTime('2017-01-20 16:00:00', new \DateTimeZone('UTC'));
        $xmlTaskConfiguration = file_get_contents(__DIR__ . '/TaskConfiguration/Requirements.xml');
        $project              = $this->createProject('project-id-1', $this->createOrganisation(), $clientUser, $date);
        $video                = $this->createVideo($this->createOrganisation(), 'video-id-1');
        $video->setOriginalId('e363906c1c4a5a5bd01e8902467d4b0e');
        $this->videoFacade->save($video);
        $task                 = $this->createTask(
            $project,
            $video,
            $this->createTaskConfiguration(
                $xmlTaskConfiguration,
                $this->createOrganisation(),
                $clientUser,
                'testconfig',
                'testconfig.xml',
                'application/xml',
                'requirementsXml'
            ),
            null,
            AppBundleModel\LabelingTask::TYPE_OBJECT_LABELING
        );

        $this->createCuboids($task);

        $export = $this->exporterFacade->save(
            new AppBundleModel\Export($project, $clientUser, $date)
        );

        $this->exporter->export($export);

        $attachments = $export->getAttachments();

        $content = $this->removeIdValues(
            $this->getContentFromZip(reset($attachments)->getRawData(), 'video-id-1.xml')
        );

        $this->assertEquals(file_get_contents(__DIR__ . '/Expected/Requirements.xml'), $content);
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
        $groupIds = $xpath->query('/x:export/x:video/x:group[@id]');
        foreach ($groupIds as $groupId) {
            $groupId->setAttribute('id', '');
        }
        $taskIds = $xpath->query('/x:export/x:video/x:thing/x:references/x:task[@id]');
        foreach ($taskIds as $taskId) {
            $taskId->setAttribute('id', '');
        }
        $groupIds = $xpath->query('/x:export/x:video/x:thing/x:references/x:group[@ref]');
        foreach ($groupIds as $groupId) {
            $groupId->setAttribute('ref', '');
        }

        return $document->saveXML();

    }

    private function createCuboids(AppBundleModel\LabelingTask $task)
    {
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
        $this->createLabeledThingInFrame($labeledThing, 1, [$cuboid1->toArray()], ['u-turn', 'germany']);
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
        $this->createLabeledThingInFrame($labeledThing, 2, [$cuboid2->toArray()], ['u-turn', 'germany']);
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
        $this->createLabeledThingInFrame($labeledThing, 3, [$cuboid3->toArray()], ['u-turn', 'spain']);
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
        $this->createLabeledThingInFrame($labeledThing, 4, [$cuboid4->toArray()], ['u-turn', 'spain']);
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
        $this->createLabeledThingInFrame($labeledThing, 5, [$cuboid5->toArray()], ['u-turn', 'spain']);

        $labeledThingGroup = new Model\LabeledThingGroup($task, 1);
        $this->labeledThingGroupFacade->save($labeledThingGroup);

        $labeledThingWithGroup1 = $this->createLabeledThing($task);
        $labeledThingWithGroup1->setOriginalId('e363906c1c4a5a5bd01e890246819813');
        $labeledThingWithGroup1->setFrameRange(new AppBundleModel\FrameIndexRange(0, 0));
        $labeledThingWithGroup1->setGroupIds([$labeledThingGroup->getId()]);
        $this->labeledThingFacade->save($labeledThingWithGroup1);
        $rectangle1 = new Shapes\Rectangle('3659ecca-7c2b-440b-8dfa-38426c7969b7', 1, 2, 3, 4);
        $this->createLabeledThingInFrame($labeledThingWithGroup1, 0, [$rectangle1->toArray()], ['u-turn', 'spain']);

        $labeledThingWithGroup2 = $this->createLabeledThing($task);
        $labeledThingWithGroup2->setOriginalId('e363906c1c4a5a5bd01e89024681a191');
        $labeledThingWithGroup2->setFrameRange(new AppBundleModel\FrameIndexRange(0, 1));
        $labeledThingWithGroup2->setGroupIds([$labeledThingGroup->getId()]);
        $this->labeledThingFacade->save($labeledThingWithGroup2);
        $rectangle2 = new Shapes\Rectangle('3659ecca-7c2b-440b-8dfa-38426c7969b7', 1, 2, 3, 4);
        $this->createLabeledThingInFrame($labeledThingWithGroup2, 1, [$rectangle2->toArray()], ['u-turn', 'spain']);

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
        $this->createLabeledThingInFrame($polygonLabeledThing, 1, [$polygon->toArray()], ['lane-yes']);

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
        $this->createLabeledThingInFrame($polylineLabeledThing, 1, [$polyline->toArray()], ['lane-open-no']);

        $pointLabeledThing = $this->createLabeledThing($task);
        $pointLabeledThing->setOriginalId('e363906c1c4a5a5bd01e89024681abcf');
        $pointLabeledThing->setFrameRange(new AppBundleModel\FrameIndexRange(1, 1));
        $this->labeledThingFacade->save($pointLabeledThing);
        $point = new Shapes\Point(
            '3659ecca-7c2b-440b-8dfa-38426c79abcf',
            ['x' => 624, 'y' => 321]
        );
        $this->createLabeledThingInFrame($pointLabeledThing, 1, [$point->toArray()], ['lightsource-yes']);
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

    protected function setUpImplementation()
    {
        $this->exporter                = $this->getAnnostationService('service.exporter.requirements_project_to_xml');
        $this->exporterFacade          = $this->getAnnostationService('database.facade.exporter');

        parent::setUpImplementation();
    }
}
