<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class Video
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * Video constructor.
     *
     * @param Facade\Video $videoFacade
     */
    public function __construct(Facade\Video $videoFacade)
    {
        $this->videoFacade = $videoFacade;
    }

    /**
     * @param Model\Video $video
     *
     * @return Model\Video
     */
    public function save(Model\Video $video)
    {
        return $this->videoFacade->save($video);
    }
}