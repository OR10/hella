<?php

namespace AnnoStationBundle\Helper\IncompleteClassesChecker;

use AppBundle\Model;
use AnnoStationBundle\Helper;

class RequirementsXml extends Helper\ClassesStructure
{
    /**
     * @var \DOMDocument|null
     */
    private $document = null;

    public function __construct($xml)
    {
        $this->document = $this->loadXmlDocument($xml);
    }

    public function getStructure(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        return $this->getRequiredClasses($labeledThingInFrame->getIdentifierName());
    }

    /**
     * @param $identifier
     *
     * @return array
     */
    private function getRequiredClasses($identifier)
    {
        $xpath = new \DOMXPath($this->document);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes = [];
        foreach ($xpath->query('//x:requirements/x:thing[@id="' . $identifier . '"]') as $thing) {
            foreach ($xpath->query('x:class', $thing) as $classNode) {
                $values = [];
                foreach ($xpath->query('x:value', $classNode) as $valueNode) {
                    if ($xpath->query('x:class', $valueNode)->length > 0) {
                        $values[] = [
                            'name' => $valueNode->getAttribute('id'),
                            'children' => $this->getChildrenStructure($xpath, $xpath->query('x:class', $valueNode))
                        ];

                    }else{
                        $values[] = ['name' => $valueNode->getAttribute('id')];
                    }
                }
                $classes[] = $values;
            }
        }

        return $classes;
    }

    /**
     * @param $xpath
     * @param $children
     *
     * @return array
     */
    private function getChildrenStructure($xpath, $children)
    {
        $values = [];
        foreach ($children as $value) {
            if ($xpath->query('x:class', $value)->length > 0) {
                $values[] = [
                    'name' => $value->getAttribute('id'),
                    'children' => $this->getChildrenStructure($xpath, $xpath->query('x:class', $value))
                ];

            }else{
                $values[] = ['name' => $value->getAttribute('id')];
            }
        }

        return [$values];
    }
}