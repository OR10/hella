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

    public function __construct(Model\LabelingTask $labelingTask)
    {

        $this->labelingTask = $labelingTask;
    }

    public function getElement(\DOMDocument $document)
    {
        $task = $document->createElement('task');
        $task->setAttribute('id', $this->labelingTask->getId());

        return $task;
    }
}