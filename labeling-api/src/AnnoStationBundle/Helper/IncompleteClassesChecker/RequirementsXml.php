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
     * @param \DOMXPath $xpath
     * @param           $id
     *
     * @return bool|\DOMElement
     */
    private function findReferenceClass(\DOMXPath $xpath, $id)
    {
        foreach ($xpath->query('//x:requirements/x:thing/x:class') as $class) {
            if ($class->getAttribute('id') === $id) {
                return $class;
            } elseif ($xpath->query('x:value', $class)->length > 0) {
                $childClass = $this->getClassChildrenReferences($xpath, $class, $id);
                if ($childClass !== false) {
                    return $childClass;
                }
            }
        }

        foreach ($xpath->query('//x:requirements/x:private/x:class') as $class) {
            if ($class->getAttribute('id') === $id) {
                return $class;
            } elseif ($xpath->query('x:value', $class)->length > 0) {
                $childClass = $this->getClassChildrenReferences($xpath, $class, $id);
                if ($childClass !== false) {
                    return $childClass;
                }
            }
        }

        throw new \RuntimeException('XML Reference not found ' . $id);
    }

    /**
     * @param $xpath
     * @param $children
     * @param $id
     *
     * @return bool|\DOMElement
     */
    private function getClassChildrenReferences($xpath, $children, $id)
    {
        foreach ($xpath->query('x:value/x:class', $children) as $valueNode) {
            if ($valueNode->getAttribute('id') === $id) {
                return $valueNode;
            } elseif ($xpath->query('x:value', $valueNode)->length > 0) {
                $childClass = $this->getClassChildrenReferences($xpath, $valueNode, $id);
                if ($childClass !== false) {
                    return $childClass;
                }
            }
        }

        return false;
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
                if ($classNode->hasAttribute('ref')) {
                    $classNode = $this->findReferenceClass($xpath, $classNode->getAttribute('ref'));
                }
                foreach ($xpath->query('x:value', $classNode) as $valueNode) {
                    if ($xpath->query('x:class', $valueNode)->length > 0) {
                        $values[] = [
                            'name'     => $valueNode->getAttribute('id'),
                            'children' => $this->getChildrenStructure($xpath, $xpath->query('x:class', $valueNode)),
                        ];
                    } else {
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
            if ($value->hasAttribute('ref')) {
                $value = $this->findReferenceClass($xpath, $value->getAttribute('ref'));
            }
            foreach ($xpath->query('x:value', $value) as $valueNode) {
                if ($xpath->query('x:class', $valueNode)->length > 0) {
                    $values[] = [
                        'name'     => $valueNode->getAttribute('id'),
                        'children' => $this->getChildrenStructure($xpath, $xpath->query('x:class', $valueNode)),
                    ];
                } else {
                    $values[] = ['name' => $valueNode->getAttribute('id')];
                }
            }
        }

        return [$values];
    }
}
