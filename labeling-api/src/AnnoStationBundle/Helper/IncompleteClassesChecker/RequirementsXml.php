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

    public function getLabeledThingInFrameStructure(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        return $this->getRequiredClassesForLabeledThingInFrame($labeledThingInFrame->getIdentifierName());
    }

    /**
     * @return array
     */
    public function getLabeledFrameStructure()
    {
        return $this->getRequiredClassesForLabeledFrame();
    }

    /**
     * @param \DOMXPath $xpath
     * @param           $id
     *
     * @return bool|\DOMElement
     */
    private function findReferenceClassForLabeledThingInFrame(\DOMXPath $xpath, $id)
    {
        $thingClassReference = $this->findReferenceClassForExpression(
            $xpath,
            '//x:requirements/x:thing/x:class',
            $id
        );
        if ($thingClassReference !== null) {
            return $thingClassReference;
        }

        $privateClassReference = $this->findReferenceClassForExpression(
            $xpath,
            '//x:requirements/x:private/x:class',
            $id
        );
        if ($privateClassReference !== null) {
            return $privateClassReference;
        }

        throw new \RuntimeException('XML Reference not found ' . $id);
    }

    /**
     * @param \DOMXPath $xpath
     * @param           $id
     *
     * @return bool|\DOMElement
     */
    private function findReferenceClassForLabeledFrame(\DOMXPath $xpath, $id)
    {
        $frameClassReference = $this->findReferenceClassForExpression(
            $xpath,
            '//x:requirements/x:frame/x:class',
            $id
        );
        if ($frameClassReference !== null) {
            return $frameClassReference;
        }

        $privateClassReference = $this->findReferenceClassForExpression(
            $xpath,
            '//x:requirements/x:private/x:class',
            $id
        );
        if ($privateClassReference !== null) {
            return $privateClassReference;
        }

        throw new \RuntimeException('XML Reference not found ' . $id);
    }

    private function findReferenceClassForExpression(\DOMXPath $xpath, $expression, $id)
    {
        foreach ($xpath->query($expression) as $class) {
            if ($class->getAttribute('id') === $id) {
                return $class;
            } elseif ($xpath->query('x:value', $class)->length > 0) {
                $childClass = $this->getClassChildrenReferences($xpath, $class, $id);
                if ($childClass !== false) {
                    return $childClass;
                }
            }
        }

        return null;
    }

    /**
     * @param $xpath
     * @param $children
     * @param $id
     *
     * @return bool|\DOMElement
     */
    private function getClassChildrenReferences(\DOMXPath $xpath, $children, $id)
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
    private function getRequiredClassesForLabeledThingInFrame($identifier)
    {
        $xpath = new \DOMXPath($this->document);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes = [];
        foreach ($xpath->query('//x:requirements/x:thing[@id="' . $identifier . '"]') as $thing) {
            foreach ($xpath->query('x:class', $thing) as $classNode) {
                if ($classNode->hasAttribute('ref')) {
                    $classNode = $this->findReferenceClassForLabeledThingInFrame(
                        $xpath,
                        $classNode->getAttribute('ref')
                    );
                }
                $classes[] = $this->getValuesFromLabeledThingInFrameNode($xpath, $classNode);
            }
        }

        return $classes;
    }

    /**
     * @param \DOMXPath $xpath
     * @param \DOMNode  $classNode
     *
     * @return array
     */
    private function getValuesFromLabeledThingInFrameNode(\DOMXPath $xpath, \DOMNode $classNode)
    {
        $values = [];
        foreach ($xpath->query('x:value', $classNode) as $valueNode) {
            if ($xpath->query('x:class', $valueNode)->length > 0) {
                $values[] = [
                    'name'     => $valueNode->getAttribute('id'),
                    'children' => $this->getChildrenStructureForLabeledThingInFrame(
                        $xpath,
                        $xpath->query('x:class', $valueNode)
                    ),
                ];
            } else {
                $values[] = ['name' => $valueNode->getAttribute('id')];
            }
        }

        return $values;
    }

    /**
     * @return array
     */
    private function getRequiredClassesForLabeledFrame()
    {
        $xpath = new \DOMXPath($this->document);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes      = [];
        $labeledFrame = $xpath->query('//x:requirements/x:frame')->item(0);
        foreach ($xpath->query('x:class', $labeledFrame) as $classNode) {
            if ($classNode->hasAttribute('ref')) {
                $classNode = $this->findReferenceClassForLabeledThingInFrame($xpath, $classNode->getAttribute('ref'));
            }
            $classes[] = $this->getValuesFromLabeledFrameNode($xpath, $classNode);
        }

        return $classes;
    }

    /**
     * @param \DOMXPath $xpath
     * @param \DOMNode  $classNode
     *
     * @return array
     */
    private function getValuesFromLabeledFrameNode(\DOMXPath $xpath, \DOMNode $classNode)
    {
        $values = [];
        foreach ($xpath->query('x:value', $classNode) as $valueNode) {
            if ($xpath->query('x:class', $valueNode)->length > 0) {
                $values[] = [
                    'name'     => $valueNode->getAttribute('id'),
                    'children' => $this->getChildrenStructureForLabeledFrame(
                        $xpath,
                        $xpath->query('x:class', $valueNode)
                    ),
                ];
            } else {
                $values[] = ['name' => $valueNode->getAttribute('id')];
            }
        }

        return $values;
    }

    /**
     * @param $xpath
     * @param $children
     *
     * @return array
     */
    private function getChildrenStructureForLabeledThingInFrame($xpath, $children)
    {
        $values = [];
        foreach ($children as $value) {
            $values = array_merge($values, $this->getChildValuesFromLabeledThingInFrameNode($xpath, $value));
        }

        return [$values];
    }

    /**
     * @param \DOMXPath $xpath
     * @param           $value
     *
     * @return array
     */
    private function getChildValuesFromLabeledThingInFrameNode(\DOMXPath $xpath, $value)
    {
        $values = [];
        if ($value->hasAttribute('ref')) {
            $value = $this->findReferenceClassForLabeledThingInFrame($xpath, $value->getAttribute('ref'));
        }
        foreach ($xpath->query('x:value', $value) as $valueNode) {
            if ($xpath->query('x:class', $valueNode)->length > 0) {
                $values[] = [
                    'name'     => $valueNode->getAttribute('id'),
                    'children' => $this->getChildrenStructureForLabeledThingInFrame(
                        $xpath,
                        $xpath->query('x:class', $valueNode)
                    ),
                ];
            } else {
                $values[] = ['name' => $valueNode->getAttribute('id')];
            }
        }

        return $values;
    }

    /**
     * @param $xpath
     * @param $children
     *
     * @return array
     */
    private function getChildrenStructureForLabeledFrame($xpath, $children)
    {
        $values = [];
        foreach ($children as $value) {
            $values = array_merge($values, $this->getChildValuesFromLabeledFrameNode($xpath, $value));
        }

        return [$values];
    }

    /**
     * @param \DOMXPath $xpath
     * @param           $value
     *
     * @return array
     */
    private function getChildValuesFromLabeledFrameNode(\DOMXPath $xpath, $value)
    {
        $values = [];
        if ($value->hasAttribute('ref')) {
            $value = $this->findReferenceClassForLabeledFrame($xpath, $value->getAttribute('ref'));
        }
        foreach ($xpath->query('x:value', $value) as $valueNode) {
            if ($xpath->query('x:class', $valueNode)->length > 0) {
                $values[] = [
                    'name'     => $valueNode->getAttribute('id'),
                    'children' => $this->getChildrenStructureForLabeledFrame(
                        $xpath,
                        $xpath->query('x:class', $valueNode)
                    ),
                ];
            } else {
                $values[] = ['name' => $valueNode->getAttribute('id')];
            }
        }

        return $values;
    }
}
