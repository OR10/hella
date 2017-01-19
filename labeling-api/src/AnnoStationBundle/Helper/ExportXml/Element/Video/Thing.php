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
     * @var Model\LabelingTask
     */
    private $labelingTask;

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

    public function __construct(
        Model\LabelingTask $labelingTask,
        Model\LabeledThing $labeledThing,
        $namespace
    ) {
        $this->labeledThing        = $labeledThing;
        $this->labelingTask        = $labelingTask;
        $this->namespace           = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $thing = $document->createElementNS($this->namespace, 'thing');

        $thing->setAttribute('id', $this->labeledThing->getId());

        $frameNumberMapping = $this->labelingTask->getFrameNumberMapping();

        $thing->setAttribute('start', $frameNumberMapping[$this->labeledThing->getFrameRange()->getStartFrameIndex()]);
        $thing->setAttribute('end', $frameNumberMapping[$this->labeledThing->getFrameRange()->getEndFrameIndex()]);
        $thing->setAttribute('line-color', $this->labeledThing->getLineColor());

        if ($this->labeledThing->getIncomplete()) {
            $thing->setAttribute('incomplete', 'true');
        }

        $task = new Task($this->labelingTask, $this->namespace);
        $thing->appendChild($task->getElement($document));

        foreach($this->shapes as $shape) {
            $thing->appendChild($shape->getElement($document));
        }

        foreach($this->values as $value) {
            $valueElement = $document->createElementNS($this->namespace, 'value');
            $valueElement->setAttribute('id', $value['value']);
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

    public function addValue($value, $start, $end){
        $this->values[] = [
            'value' => $value,
            'start' => $start,
            'end'   => $end,
        ];
    }
}