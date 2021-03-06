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

    /**
     * @var array
     */
    private $groups = [];

    /**
     * @var array
     */
    private $block = [];

    /**
     * @var
     */
    private $namespace;

    /**
     * @var Video\FrameLabeling
     */
    private $frame;

    public function __construct(Model\Video $video, $namespace)
    {
        $this->video     = $video;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $video = $document->createElementNS($this->namespace, 'video');

        if ($this->video->getOriginalId() === null) {
            $video->setAttribute('id', $this->video->getId());
        } else {
            $video->setAttribute('id', $this->video->getOriginalId());
        }
        $video->setAttribute('filename', $this->video->getName());

        $metadata = new Video\Metadata($this->namespace, $this->video);
        $video->appendChild($metadata->getElement($document));

        if ($this->frame instanceof Video\FrameLabeling) {
            $video->appendChild($this->frame->getElement($document));
        }

        foreach ($this->groups as $group) {
            $video->appendChild($group->getElement($document));
        }
        foreach ($this->things as $thing) {
            $video->appendChild($thing->getElement($document));
        }
        foreach ($this->block as $block) {
            $video->appendChild($block->getElement($document));
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

    /**
     * @param $block
     */
    public function addBlock($block)
    {
        $this->block[] = $block;
    }

    /**
     * @param Video\FrameLabeling $frame
     */
    public function setFrame(Video\FrameLabeling $frame)
    {
        $this->frame = $frame;
    }

    /**
     * @param Video\Group $group
     */
    public function addGroup(ExportXml\Element\Video\Group $group)
    {
        $this->groups[$group->getGroupId()] = $group;
    }
}
