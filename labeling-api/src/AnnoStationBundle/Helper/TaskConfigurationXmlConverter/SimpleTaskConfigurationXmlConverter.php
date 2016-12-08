<?php

namespace AnnoStationBundle\Helper\TaskConfigurationXmlConverter;

use AnnoStationBundle\Helper\TaskConfigurationXmlConverter;
use AppBundle\Model;

class SimpleTaskConfigurationXmlConverter extends TaskConfigurationXmlConverter
{
    public function __construct($xml)
    {
        parent::__construct($xml);
    }

    /**
     * Retrieve a `labelStructure` like array definition of the xml configuration
     *
     * The returned structure can be easily serialized with json_encode.
     */
    public function getLabelStructure()
    {
        $rootStructure = array(
            'name'     => 'root',
            'children' => array(),
        );

        $xpath = new \DOMXPath($this->document);

        foreach ($xpath->query('class') as $classNode) {
            $classStructure = array(
                'name'     => $classNode->getAttribute('id'),
                'children' => array(),
            );

            foreach ($xpath->query('value', $classNode) as $valueNode) {
                $valueStructure               = array(
                    'name' => $valueNode->getAttribute('id'),
                );
                $classStructure['children'][] = $valueStructure;
            }

            $rootStructure['children'][] = $classStructure;
        }

        return $rootStructure;
    }

    /**
     * Retrieve a `labelStructureUi` like array definition of the xml configuration
     *
     * The returned structure can be easily serialized with json_encode.
     */
    public function getLabelStructureUi()
    {
        $uiStructure = array();

        $xpath = new \DOMXPath($this->document);

        foreach ($xpath->query('class') as $classNode) {
            $uiStructure[$classNode->getAttribute('id')] = array('challenge' => $classNode->getAttribute('name'));
        }

        foreach ($xpath->query('class/value') as $valueNode) {
            $uiStructure[$valueNode->getAttribute('id')] = array('response' => $valueNode->getAttribute('name'));
        }

        return $uiStructure;
    }

    public function getDrawingTool()
    {
        $xpath = new \DOMXPath($this->document);

        return $xpath->evaluate("string(/*/@shape)");
    }

    public function getDrawingToolOptions()
    {
        $xpath = new \DOMXPath($this->document);

        return [
            $this->getDrawingTool() => [
                'minimalHeight' => is_nan($xpath->evaluate("number(/*/@minimalHeight)")) ? 22 : $xpath->evaluate(
                    "number(/*/@minimalHeight)"
                ),
            ]
        ];
    }

    public function getMinimalVisibleShapeOverflow()
    {
        $xpath = new \DOMXPath($this->document);

        if (is_nan($xpath->evaluate("number(/*/@minimalVisibleShapeOverflow)"))) {
            return null;
        }

        return $xpath->evaluate("number(/*/@minimalVisibleShapeOverflow)");
    }

    public function isMetaLabelingConfiguration()
    {
        $xpath = new \DOMXPath($this->document);
        return $xpath->query('/metaLabelTaskConfig')->length === 1;
    }

    /**
     * Retrieve the json-like array representation of the information stored in the XML
     *
     * @return array
     */
    public function convertToJson()
    {
        return array(
            'labelStructure' => $this->getLabelStructure(),
            'labelStructureUi' => $this->getLabelStructureUi(),
            'drawingTool' => $this->getDrawingTool(),
            'drawingToolOptions' => $this->getDrawingToolOptions(),
            'minimalVisibleShapeOverflow' => $this->getMinimalVisibleShapeOverflow(),
            'isMetaLabelingConfiguration' => $this->isMetaLabelingConfiguration(),
        );
    }

    /**
     * @return string[][]
     */
    public function getClassStructure()
    {
        $classes = array();
        $xpath   = new \DOMXPath($this->document);

        foreach ($xpath->query('class') as $classNode) {
            $values = array();
            foreach ($xpath->query('value', $classNode) as $valueNode) {
                $values[] = $valueNode->getAttribute('id');
            }
            $classes[$classNode->getAttribute('id')] = $values;
        }

        return $classes;
    }
}
