<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class Thing extends ExportXml\Element
{
    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;

    /**
     * @var array
     */
    private $values = [];

    /**
     * @var array
     */
    private $shapes = [];

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
        Model\LabeledThing $labeledThing,
        References $references,
        $namespace
    ) {
        $this->labeledThing       = $labeledThing;
        $this->references         = $references;
        $this->namespace          = $namespace;
        $this->frameNumberMapping = $frameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $thing = $document->createElementNS($this->namespace, 'thing');

        if ($this->labeledThing->getOriginalId() === null) {
            $thing->setAttribute('id', $this->labeledThing->getId());
        } else {
            $thing->setAttribute('id', $this->labeledThing->getOriginalId());
        }

        $thing->setAttribute(
            'start',
            $this->frameNumberMapping[$this->labeledThing->getFrameRange()->getStartFrameIndex()]
        );
        $thing->setAttribute(
            'end',
            $this->frameNumberMapping[$this->labeledThing->getFrameRange()->getEndFrameIndex()]
        );
        $thing->setAttribute('line-color', $this->labeledThing->getLineColor());

        $thing->setAttribute('type', $this->type);

        if ($this->labeledThing->getIncomplete()) {
            $thing->setAttribute('incomplete', 'true');
        }

        $createdByUserId = $this->labeledThing->getCreatedByUserId();
        if ($createdByUserId !== null) {
            $createdBy = $document->createElementNS(
                $this->namespace,
                'created-by',
                $this->labeledThing->getCreatedByUserId()
            );
            $thing->appendChild($createdBy);
        }

        $createdAtDate = $this->labeledThing->getCreatedAt();
        if ($createdAtDate instanceof \DateTime) {
            $createdAt = $document->createElementNS(
                $this->namespace,
                'created-at',
                $this->labeledThing->getCreatedAt()->format('c')
            );
            $thing->appendChild($createdAt);
        }
        
        $lastModifiedByUserId = $this->labeledThing->getlastModifiedByUserId();
        if ($lastModifiedByUserId !== null) {
            $lastModifiedBy = $document->createElementNS(
                $this->namespace,
                'last-modified-by',
                $this->labeledThing->getlastModifiedByUserId()
            );
            $thing->appendChild($lastModifiedBy);
        }

        $lastModifiedAtDate = $this->labeledThing->getlastModifiedAt();
        if ($lastModifiedAtDate instanceof \DateTime) {
            $lastModifiedAt = $document->createElementNS(
                $this->namespace,
                'last-modified-at',
                $this->labeledThing->getlastModifiedAt()->format('c')
            );
            $thing->appendChild($lastModifiedAt);
        }

        $thing->appendChild($this->references->getElement($document));

        foreach ($this->shapes as $shape) {
            $thing->appendChild($shape->getElement($document));
        }

        foreach ($this->values as $value) {
            $valueElement = $document->createElementNS($this->namespace, 'value');
            $valueElement->setAttribute('id', $value['value']);
            $valueElement->setAttribute('class', $value['class']);
            $valueElement->setAttribute('start', $value['start']);
            $valueElement->setAttribute('end', $value['end']);
            $thing->appendChild($valueElement);
        }

        return $thing;
    }

    public function addShape(Shape $shape)
    {
        $this->shapes[] = $shape;
    }

    public function addValue($class, $value, $start, $end)
    {
        $this->values[] = [
            'class' => $class,
            'value' => $value,
            'start' => $start,
            'end'   => $end,
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
