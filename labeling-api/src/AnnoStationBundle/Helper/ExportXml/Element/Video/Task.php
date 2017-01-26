<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model;

class Task extends ExportXml\Element
{

    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Model\LabelingTask $labelingTask, $namespace)
    {

        $this->labelingTask = $labelingTask;
        $this->namespace    = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $task = $document->createElementNS($this->namespace, 'task');
        $task->setAttribute('id', $this->labelingTask->getId());

        return $task;
    }
}
