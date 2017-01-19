<?php
namespace AnnoStationBundle\Helper\ExportXml\Element;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;
use AppBundle\Database\Facade as AppBundleFacade;

class Video extends ExportXml\Element
{
    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var array
     */
    private $things = [];

    public function __construct(Model\Video $video)
    {
        $this->video = $video;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $video = $document->createElement('video');

        $video->setAttribute('id', $this->video->getId());
        $video->setAttribute('name', $this->video->getName());

        foreach ($this->things as $thing) {
            $video->appendChild($thing->getElement($document));
        }

        return $video;
    }

    /**
     * @param Video\Thing $thing
     */
    public function addThing(Video\Thing $thing)
    {
        $this->things[] = $thing;
    }
}