<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class Block extends ExportXml\Element
{
    /**
     * @var Model\LabeledBlock
     */
    private $labeledBlock;

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
        Model\LabeledBlockInFrame $labeledThing,
        References $references,
        $namespace
    ) {
        $this->labeledBlock       = $labeledThing;   //changed to LabeledBlock model
        $this->references         = $references;
        $this->namespace          = $namespace;
        $this->frameNumberMapping = $frameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $block = $document->createElementNS($this->namespace, 'blockage-labeling'); //blockage-labeling

        $block->setAttribute('incomplete', $this->labeledBlock->getStatus());

        $block->setAttribute('id', $this->labeledBlock->getId());

        $block->setAttribute(
            'start', //$this->frameNumberMapping[(int)$this->labeledBlock->getFrameIndex()]
            $this->frameNumberMapping[$this->labeledBlock->getFrameRange()->getStartFrameIndex()]
        );
        $block->setAttribute(
            'end', //$this->frameNumberMapping[(int)$this->labeledBlock->getFrameIndex()]
            $this->frameNumberMapping[$this->labeledBlock->getFrameRange()->getEndFrameIndex()]
        );

        $createdByUserId = $this->labeledBlock->getCreatedByUserId();
        if ($createdByUserId !== null) {
            $createdBy = $document->createElementNS(
                $this->namespace,
                'created-by',
                $this->labeledBlock->getCreatedByUserId()
            );
            $block->appendChild($createdBy);
        }

        $createdAtDate = $this->labeledBlock->getCreatedAt();
        if ($createdAtDate instanceof \DateTime) {
            $createdAt = $document->createElementNS(
                $this->namespace,
                'created-at',
                $this->labeledBlock->getCreatedAt()->format('c')
            );
            $block->appendChild($createdAt);
        }

        $lastModifiedByUserId = $this->labeledBlock->getlastModifiedByUserId();
        if ($lastModifiedByUserId !== null) {
            $lastModifiedBy = $document->createElementNS(
                $this->namespace,
                'last-modified-by',
                $this->labeledBlock->getlastModifiedByUserId()
            );
            $block->appendChild($lastModifiedBy);
        }

        $lastModifiedAtDate = $this->labeledBlock->getlastModifiedAt();
        if ($lastModifiedAtDate instanceof \DateTime) {
            $lastModifiedAt = $document->createElementNS(
                $this->namespace,
                'last-modified-at',
                $this->labeledBlock->getlastModifiedAt()->format('c')
            );
            $block->appendChild($lastModifiedAt);
        }

        $block->appendChild($this->references->getElement($document));

        foreach ($this->blocks as $shape) {
            $block->appendChild($shape->getElement($document));
        }
        /*
        foreach ($this->values as $value) {
            $valueElement = $document->createElementNS($this->namespace, 'value');
            $valueElement->setAttribute('id', $value['value']);
            $valueElement->setAttribute('class', $value['class']);
            $valueElement->setAttribute('start', $value['start']);
            $valueElement->setAttribute('end', $value['end']);
            if ($value['default']) {
                $valueElement->setAttribute('default', 'true');
            }
            $thing->appendChild($valueElement);
        }*/

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
