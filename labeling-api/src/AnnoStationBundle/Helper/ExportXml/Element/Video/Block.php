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
    private $blockStatus;

    /**
     * Block constructor.
     * @param References $references
     * @param $namespace
     */
    public function __construct(
        References $references,
        $namespace,
        $blockStatus
    ) {
        $this->references         = $references;
        $this->namespace          = $namespace;
        $this->blockStatus        = $blockStatus;
    }

    public function getElement(\DOMDocument $document)
    {
        $block = $document->createElementNS($this->namespace, 'blockage-labeling');
        if(!empty($this->blockStatus)) {
            $block->setAttribute('incomplete', (in_array(true, $this->blockStatus)) ? 'true' : 'false');
        } else {
            $block->setAttribute('incomplete', 'true');
        }

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
