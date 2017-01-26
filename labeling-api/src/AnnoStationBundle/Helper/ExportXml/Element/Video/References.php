<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;

class References extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    /**
     * @var Task
     */
    private $task;

    /**
     * @var array
     */
    private $groupIds = [];

    public function __construct(Task $task, $namespace)
    {
        $this->namespace = $namespace;
        $this->task      = $task;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $references = $document->createElementNS($this->namespace, 'references');
        $references->appendChild($this->task->getElement($document));

        foreach ($this->groupIds as $groupId) {
            $group = $document->createElementNS($this->namespace, 'group');
            $group->setAttribute('ref', $groupId);
            $references->appendChild($group);
        }

        return $references;
    }

    /**
     * @param $groupId
     */
    public function addGroup($groupId)
    {
        $this->groupIds[] = $groupId;
    }
}
