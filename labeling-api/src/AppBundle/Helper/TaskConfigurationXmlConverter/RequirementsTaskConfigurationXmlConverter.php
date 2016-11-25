<?php

namespace AppBundle\Helper\TaskConfigurationXmlConverter;

use AppBundle\Helper\TaskConfigurationXmlConverter;
use AppBundle\Model;

class RequirementsTaskConfigurationXmlConverter extends TaskConfigurationXmlConverter
{
    public function __construct($xml)
    {
        parent::__construct($xml);
    }

    /**
     * Retrieve a `labelStructure` like array definition of the xml configuration
     *
     * The returned structure can be easily serialized with json_encode.
     *
     * @param $identifierName
     *
     * @return array
     */
    public function getLabelStructure($identifierName)
    {
        $rootStructure = array(
            'name'     => 'root',
            'children' => array(),
        );

        $xpath = new \DOMXPath($this->document);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        foreach ($xpath->query('//x:requirements/x:thing[@id="' . $identifierName . '"]') as $thing) {
            foreach ($xpath->query('x:class', $thing) as $classNode) {
                $classStructure = array(
                    'name'     => $classNode->getAttribute('id'),
                    'children' => array(),
                );

                foreach ($xpath->query('x:value', $classNode) as $valueNode) {
                    $valueStructure               = array(
                        'name' => $valueNode->getAttribute('id'),
                    );
                    $classStructure['children'][] = $valueStructure;
                }
                $rootStructure['children'][] = $classStructure;
            }
        }

        return $rootStructure;
    }

    /**
     * @return string[][]
     */
    public function getClassStructure()
    {
        $classes = array();
        $xpath   = new \DOMXPath($this->document);

        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        foreach ($xpath->query('//x:requirements/x:thing') as $thing) {
            foreach ($xpath->query('x:class', $thing) as $classNode) {
                $values = array();
                foreach ($xpath->query('x:value', $classNode) as $valueNode) {
                    $values[] = $valueNode->getAttribute('id');
                }
                $classes[$classNode->getAttribute('id')] = $values;
            }
        }

        return $classes;
    }
}
