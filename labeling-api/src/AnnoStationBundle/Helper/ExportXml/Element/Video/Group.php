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

    /**
     * @var array
     */
    private $values = [];

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
        $group->setAttribute('type', $this->labeledThingGroup->getIdentifierName());
        $group->setAttribute('line-color', $this->labeledThingGroup->getLineColor());
        $group->setAttribute('incomplete', ($this->incomplete) ? 'true' : 'false');

        $createdByUserId = $this->labeledThingGroup->getCreatedByUserId();
        if ($createdByUserId !== null) {
            $createdBy = $document->createElementNS(
                $this->namespace,
                'created-by',
                $this->labeledThingGroup->getCreatedByUserId()
            );
            $group->appendChild($createdBy);
        }

        $createdAtDate = $this->labeledThingGroup->getCreatedAt();
        if ($createdAtDate instanceof \DateTime) {
            $createdAt = $document->createElementNS(
                $this->namespace,
                'created-at',
                $this->labeledThingGroup->getCreatedAt()->format('c')
            );
            $group->appendChild($createdAt);
        }

        $lastModifiedByUserId = $this->labeledThingGroup->getLastModifiedByUserId();
        if ($lastModifiedByUserId !== null) {
            $lastModified = $document->createElementNS(
                $this->namespace,
                'last-modified-by',
                $this->labeledThingGroup->getLastModifiedByUserId()
            );
            $group->appendChild($lastModified);
        }

        $lastModifiedAtDate = $this->labeledThingGroup->getLastModifiedAt();
        if ($lastModifiedAtDate instanceof \DateTime) {
            $lastModifiedAt = $document->createElementNS(
                $this->namespace,
                'last-modified-at',
                $this->labeledThingGroup->getLastModifiedAt()->format('c')
            );
            $group->appendChild($lastModifiedAt);
        }

        foreach ($this->values as $value) {
            $valueElement = $document->createElementNS($this->namespace, 'value');
            $valueElement->setAttribute('id', $value['value']);
            $valueElement->setAttribute('class', $value['class']);
            $valueElement->setAttribute('start', $value['start']);
            $valueElement->setAttribute('end', $value['end']);
            if ($value['default']) {
                $valueElement->setAttribute('default', 'true');
            }
            $group->appendChild($valueElement);
        }

        return $group;
    }

    /**
     * @param      $class
     * @param      $value
     * @param      $start
     * @param      $end
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
     * @return mixed
     */
    public function getGroupId()
    {
        return $this->labeledThingGroup->getId();
    }
}
