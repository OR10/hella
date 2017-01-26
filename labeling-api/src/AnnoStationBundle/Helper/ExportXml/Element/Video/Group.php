<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Model;

class Group extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    /**
     * @var Model\LabeledThingGroup
     */
    private $labeledThingGroup;

    /**
     * @var int
     */
    private $start;

    /**
     * @var int
     */
    private $end;

    /**
     * @var bool
     */
    private $incomplete;

    public function __construct(Model\LabeledThingGroup $labeledThingGroup, $start, $end, $incomplete, $namespace)
    {
        $this->namespace         = $namespace;
        $this->labeledThingGroup = $labeledThingGroup;
        $this->start             = $start;
        $this->end               = $end;
        $this->incomplete        = $incomplete;
    }

    /**
     * @param \DOMDocument $document
     *
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $group = $document->createElementNS($this->namespace, 'group');
        $group->setAttribute('id', $this->labeledThingGroup->getId());
        $group->setAttribute('start', $this->start);
        $group->setAttribute('end', $this->end);
        $group->setAttribute('incomplete', ($this->incomplete) ? 'true' : 'false');

        return $group;
    }

    /**
     * @return mixed
     */
    public function getGroupId()
    {
        return $this->labeledThingGroup->getId();
    }
}
