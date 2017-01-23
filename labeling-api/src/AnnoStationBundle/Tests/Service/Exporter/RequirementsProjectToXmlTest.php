<?php

namespace AnnoStationBundle\Tests\Service\Exporter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
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
        $project              = $this->createProject('project-id-1', $clientUser, $date);
        $video                = $this->createVideo('video-id-1');
        $task                 = $this->createTask(
            $project,
            $video,
            $this->createTaskConfiguration($xmlTaskConfiguration, $clientUser),
            null,
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );

        $this->createCuboids($task);

        $export = $this->exporterFacade->save(
            new Model\Export($project, $clientUser, $date)
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
        $projectId = $xpath->query('/x:export/x:metadata/x:project[@id]');
        $projectId->item(0)->setAttribute('id', '');
        $exportId = $xpath->query('/x:export/x:metadata/x:export[@id]');
        $exportId->item(0)->setAttribute('id', '');
        $requirementsId = $xpath->query('/x:export/x:metadata/x:requirements[@id]');
        $requirementsId->item(0)->setAttribute('id', '');
        $videoId = $xpath->query('/x:export/x:video[@id]');
        $videoId->item(0)->setAttribute('id', '');
        $thingId = $xpath->query('/x:export/x:video/x:thing[@id]');
        $thingId->item(0)->setAttribute('id', '');
        $taskId = $xpath->query('/x:export/x:video/x:thing/x:task[@id]');
        $taskId->item(0)->setAttribute('id', '');
        $shapeIds = $xpath->query('/x:export/x:video/x:thing/x:shape[@id]');
        foreach($shapeIds as $shapeId) {
            $shapeId->setAttribute('id', '');
        }

        return $document->saveXML();

    }

    private function createCuboids(Model\LabelingTask $task)
    {
        $labeledThing = $this->createLabeledThing($task);
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
        $this->exporter       = $this->getAnnostationService('service.exporter.requirements_project_to_xml');
        $this->exporterFacade = $this->getAnnostationService('database.facade.exporter');

        parent::setUpImplementation();


    }
}