<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class BlockPart extends ExportXml\Element
{
    /**
     * @var Model\LabeledBlockInFrame
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
     * BlockPart constructor.
     * @param Model\LabeledBlockInFrame $labeledBlockPart
     * @param References                $references
     * @param                           $namespace
     */
    public function __construct(
        Model\LabeledBlockInFrame $labeledBlockPart,
        References $references,
        $namespace
    ) {
        $this->labeledBlockPart   = $labeledBlockPart;
        $this->references         = $references;
        $this->namespace          = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $block = $document->createElementNS($this->namespace, 'value');
        $place = $this->labeledBlockPart->getPlace();
        $block->setAttribute('id',  'sector-'.$place.'-blocked');
        $blockClass = $this->labeledBlockPart->getClasses();
        $block->setAttribute('class', (is_array($blockClass)) ? $blockClass[0] : '');

        $frameIndex = $this->labeledBlockPart->getFrameRange();
        $block->setAttribute(
            'start',
            ($frameIndex instanceof Model\FrameIndexRange) ? $frameIndex->getStartFrameIndex() : ''
        );
        $block->setAttribute(
            'end',
            ($frameIndex instanceof Model\FrameIndexRange) ? $frameIndex->getEndFrameIndex() : ''
        );

        return $block;
    }

    /**
     * @param $class
     * @param $value
     * @param $start
     * @param $end
     * @param bool $default
     */
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
