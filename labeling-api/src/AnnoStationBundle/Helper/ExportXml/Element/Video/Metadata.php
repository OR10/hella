<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class Metadata extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @param             $namespace
     * @param Model\Video $video
     */
    public function __construct($namespace, Model\Video $video)
    {
        $this->namespace = $namespace;
        $this->video     = $video;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return mixed
     */
    public function getElement(\DOMDocument $document)
    {
        $metadata = $document->createElementNS($this->namespace, 'metadata');

        $imageCoordinateSystem = $document->createElementNS($this->namespace, 'image-coordinate-system');
        $imageCoordinateSystem->setAttribute('top-left-x', 0);
        $imageCoordinateSystem->setAttribute('top-left-y', 0);
        $imageCoordinateSystem->setAttribute('bottom-right-x', $this->video->getMetaData()->width);
        $imageCoordinateSystem->setAttribute('bottom-right-y', $this->video->getMetaData()->height);
        $metadata->appendChild($imageCoordinateSystem);

        if (!empty($this->video->getTags())) {
            $tags = $document->createElementNS($this->namespace, 'tags');
            foreach ($this->video->getTags() as $tagName) {
                $tag = $document->createElementNS($this->namespace, 'tag', $tagName);
                $tags->appendChild($tag);
            }

            $metadata->appendChild($tags);
        }

        return $metadata;
    }
}
