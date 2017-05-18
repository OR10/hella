<?php

namespace AnnoStationBundle\Helper\IncompleteClassesChecker;

use AppBundle\Model;
use AnnoStationBundle\Helper;

class SimpleXml extends Helper\ClassesStructure
{
    /**
     * @var \DOMDocument|null
     */
    private $document = null;

    public function __construct($xml)
    {
        $this->document = $this->loadXmlDocument($xml);
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return array
     */
    public function getLabeledThingInFrameStructure(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        return $this->getRequiredClasses();
    }

    /**
     * @return array
     */
    private function getRequiredClasses()
    {
        $classes = [];
        $xpath = new \DOMXPath($this->document);
        foreach ($xpath->query('class') as $classNode) {
            $values = [];
            foreach ($xpath->query('value', $classNode) as $valueNode) {
                $values[] = ['name' => $valueNode->getAttribute('id')];
            }
            $classes[] = $values;
        }

        return $classes;
    }
}
