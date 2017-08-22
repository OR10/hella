<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Model;

class FrameLabeling extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    /**
     * @var array
     */
    private $values = [];

    /**
     * @var bool
     */
    private $incomplete = false;

    /**
     * @var References
     */
    private $references;

    /**
     * @param $namespace
     * @param $references
     */
    public function __construct($namespace, References $references)
    {
        $this->namespace  = $namespace;
        $this->references = $references;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return mixed
     */
    public function getElement(\DOMDocument $document)
    {
        $frameLabeling = $document->createElementNS($this->namespace, 'frame-labeling');
        $frameLabeling->setAttribute('incomplete', ($this->incomplete) ? 'true' : 'false');

        $frameLabeling->appendChild($this->references->getElement($document));

        foreach ($this->values as $value) {
            $frameLabeling->appendChild($value);
        }

        return $frameLabeling;
    }

    /**
     * @param bool $incomplete
     */
    public function setIncomplete($incomplete)
    {
        $this->incomplete = $incomplete;
    }

    /**
     * @param \DOMDocument $document
     * @param              $class
     * @param              $id
     * @param              $start
     * @param              $end
     */
    public function addValue(\DOMDocument $document, $class, $id, $start, $end)
    {
        $value = $document->createElementNS($this->namespace, 'value');
        $value->setAttribute('id', $id);
        $value->setAttribute('class', $class);
        $value->setAttribute('start', $start);
        $value->setAttribute('end', $end);

        $this->values[] = $value;
    }
}
