<?php

namespace AnnoStationBundle\Tests\Database\Facade;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;

class VideoTest extends Tests\WebTestCase
{
    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    public function testGetVideoName()
    {
        $video = $this->videoFacade->save(
            Helper\VideoBuilder::create($this->organisation)->withName('foobar.avi')->build()
        );

        $actualVideoName = $this->videoFacade->getVideoNameForId($video->getId());

        $this->assertEquals($video->getName(), $actualVideoName);
    }

    /**
     * @expectedException \RuntimeException
     */
    public function testGetVideoNameWithInvalidVideoId()
    {
        $this->videoFacade->getVideoNameForId('video_id_does_not_exists');
    }

    protected function setUpImplementation()
    {
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        /** @var Facade\Organisation $organisationFacade */
        $organisationFacade = $this->getAnnostationService('database.facade.organisation');

        $this->organisation = $organisationFacade->save(Helper\OrganisationBuilder::create()->build());
    }
}
