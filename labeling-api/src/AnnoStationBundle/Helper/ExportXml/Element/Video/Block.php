<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class Block extends ExportXml\Element
{
    /**
     * @var array
     */
    private $values = [];

    /**
     * @var array
     */
    private $blocks = [];

    /**
     * @var
     */
    private $namespace;

    /**
     * @var string
     */
    private $type;

    /**
     * @var References
     */
    private $references;

    /**
     * @var
     */
    private $frameNumberMapping;

    public function __construct(
        $frameNumberMapping,
        References $references,
        $namespace
    ) {
        $this->references         = $references;
        $this->namespace          = $namespace;
        $this->frameNumberMapping = $frameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $block = $document->createElementNS($this->namespace, 'blockage-labeling');
        $block->setAttribute('incomplete', 'false');

        $block->appendChild($this->references->getElement($document));

        foreach ($this->blocks as $shape) {
            $block->appendChild($shape->getElement($document));
        }

        return $block;
    }

    public function addBlock($block)
    {
        $this->blocks[] = $block;
    }

    public function addValue($class, $value, $start, $end, $default = false)
    {
        $this->values[] = [
            'class'   => $class,
            'value'   => $value,
            'start'   => $start,
            'end'     => $end,
            'default' => $default,
        ];
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
