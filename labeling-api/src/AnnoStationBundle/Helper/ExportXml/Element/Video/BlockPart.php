<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class BlockPart extends ExportXml\Element
{
    /**
     * @var Model\LabeledBlock
     */
    private $labeledBlockPart;

    /**
     * @var array
     */
    private $values = [];

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
        Model\LabeledBlock $labeledBlockPart,
        References $references,
        $namespace
    ) {
        $this->labeledBlockPart   = $labeledBlockPart;   //changed to LabeledBlock model
        $this->references         = $references;
        $this->namespace          = $namespace;
        $this->frameNumberMapping = $frameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $block = $document->createElementNS($this->namespace, 'value'); //blockage-labeling

        $block->setAttribute('id', $this->labeledBlockPart->getId());

        $block->setAttribute('class', 'blockage-16-'.$this->labeledBlockPart->getStatus());

        $block->setAttribute(
            'start',$this->frameNumberMapping[(int)$this->labeledBlockPart->getFrameIndex()]
        //$this->frameNumberMapping[$this->labeledBlock->getFrameRange()->getStartFrameIndex()]
        );
        $block->setAttribute(
            'end',$this->frameNumberMapping[(int)$this->labeledBlockPart->getFrameIndex()]
        // $this->frameNumberMapping[$this->labeledBlock->getFrameRange()->getEndFrameIndex()]
        );

        return $block;
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
