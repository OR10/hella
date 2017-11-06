<?php

namespace AnnoStationBundle\Helper\TaskConfiguration;

use AppBundle\Model\TaskConfiguration;

class RequirementsXml
{
    /**
     * @param TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration
     *
     * @return array
     */
    public function getValidThingIdentifiers(TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration)
    {
        $xml = $this->loadXmlDocument($requirementsXmlTaskConfiguration->getRawData());
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $identifiers = [];
        $things = $xpath->query('//x:requirements/x:thing');

        foreach($things as $thing) {
            $identifiers[] = $thing->getAttribute('id');
        }

        return $identifiers;
    }

    /**
     * @param TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration
     *
     * @return array
     */
    public function getValidGroupIdentifiers(TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration)
    {
        $xml = $this->loadXmlDocument($requirementsXmlTaskConfiguration->getRawData());
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $identifiers = [];
        $things = $xpath->query('//x:requirements/x:group');

        foreach($things as $thing) {
            $identifiers[] = $thing->getAttribute('id');
        }

        return $identifiers;
    }

    /**
     * @param TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration
     *
     * @return array
     */
    public function getValidThingClasses(TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration)
    {
        $xml = $this->loadXmlDocument($requirementsXmlTaskConfiguration->getRawData());
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes = [];
        $things = $xpath->query('//x:requirements/x:thing');

        foreach($things as $thing) {
            $classes = array_merge($classes, $this->findNestedThingClasses($xpath, $thing));
        }
        
        return array_unique($classes);
    }

    /**
     * @param \DOMXPath $xpath
     * @param \DOMNode  $node
     *
     * @return array
     */
    private function findNestedThingClasses(\DOMXPath $xpath, \DOMNode $node)
    {
        $thingIdentifiers = $xpath->query('x:class/x:value|x:class[@ref]', $node);

        $classes = [];
        foreach($thingIdentifiers as $thingIdentifier) {
            if ($thingIdentifier->hasAttribute('ref')) {
                $references = $xpath->query(
                    sprintf(
                        "/x:requirements/x:thing//x:class[@id='%s']/x:value|/x:requirements/x:private//x:class[@id='%s']/x:value",
                        $thingIdentifier->getAttribute('ref'),
                        $thingIdentifier->getAttribute('ref')
                    )
                );
                foreach($references as $reference) {
                    $classes[] = $reference->getAttribute('id');
                }
            }
            if ($thingIdentifier->hasAttribute('id')) {
                $classes[] = $thingIdentifier->getAttribute('id');
                $classes = array_merge($classes, $this->findNestedThingClasses($xpath, $thingIdentifier));
            }
        }

        return $classes;
    }

    /**
     * @param TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration
     *
     * @return array
     */
    public function getValidFrameClasses(TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration)
    {
        $xml = $this->loadXmlDocument($requirementsXmlTaskConfiguration->getRawData());
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes = [];
        $frames = $xpath->query('//x:requirements/x:frame');

        foreach($frames as $frame) {
            $classes = array_merge($classes, $this->findNestedFrameClasses($xpath, $frame));
        }

        return array_unique($classes);
    }

    /**
     * @param \DOMXPath $xpath
     * @param \DOMNode  $node
     *
     * @return array
     */
    private function findNestedFrameClasses(\DOMXPath $xpath, \DOMNode $node)
    {
        $thingIdentifiers = $xpath->query('x:class/x:value|x:class[@ref]', $node);

        $classes = [];
        foreach($thingIdentifiers as $thingIdentifier) {
            if ($thingIdentifier->hasAttribute('ref')) {
                $references = $xpath->query(
                    sprintf(
                        "/x:requirements/x:frame//x:class[@id='%s']/x:value|/x:requirements/x:private//x:class[@id='%s']/x:value",
                        $thingIdentifier->getAttribute('ref'),
                        $thingIdentifier->getAttribute('ref')
                    )
                );
                foreach($references as $reference) {
                    $classes[] = $reference->getAttribute('id');
                }
            }
            if ($thingIdentifier->hasAttribute('id')) {
                $classes[] = $thingIdentifier->getAttribute('id');
                $classes = array_merge($classes, $this->findNestedFrameClasses($xpath, $thingIdentifier));
            }
        }

        return $classes;
    }

    /**
     * @param TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration
     *
     * @return array
     */
    public function getValidGroupClasses(TaskConfiguration\RequirementsXml $requirementsXmlTaskConfiguration)
    {
        $xml = $this->loadXmlDocument($requirementsXmlTaskConfiguration->getRawData());
        $xpath = new \DOMXPath($xml);
        $xpath->registerNamespace('x', 'http://weblabel.hella-aglaia.com/schema/requirements');

        $classes = [];
        $groups = $xpath->query('//x:requirements/x:group');

        foreach($groups as $group) {
            $classes = array_merge($classes, $this->findNestedGroupClasses($xpath, $group));
        }

        return array_unique($classes);
    }

    /**
     * @param \DOMXPath $xpath
     * @param \DOMNode  $node
     *
     * @return array
     */
    private function findNestedGroupClasses(\DOMXPath $xpath, \DOMNode $node)
    {
        $groupValues = $xpath->query('x:class/x:value|x:class[@ref]', $node);

        $classes = [];
        foreach($groupValues as $groupValue) {
            if ($groupValue->hasAttribute('ref')) {
                $references = $xpath->query(
                    sprintf(
                        "/x:requirements/x:group//x:class[@id='%s']/x:value|/x:requirements/x:private//x:class[@id='%s']/x:value",
                        $groupValue->getAttribute('ref'),
                        $groupValue->getAttribute('ref')
                    )
                );
                foreach($references as $reference) {
                    $classes[] = $reference->getAttribute('id');
                }
            }
            if ($groupValue->hasAttribute('id')) {
                $classes[] = $groupValue->getAttribute('id');
                $classes = array_merge($classes, $this->findNestedGroupClasses($xpath, $groupValue));
            }
        }

        return $classes;
    }

    /**
     * @param $xml
     *
     * @return \DOMDocument
     */
    private function loadXmlDocument($xml)
    {
        $errorHandler = function ($errno, $errstr, $errfile, $errline) {
            if (
                $errno === E_WARNING &&
                strpos($errstr, "DOMDocument::loadXML()") != -1
            ) {
                throw new \DOMException($errstr);
            }

            return false;
        };

        set_error_handler($errorHandler);
        $document = new \DOMDocument();
        $document->loadXML($xml, LIBXML_COMPACT | LIBXML_NONET);
        restore_error_handler();

        return $document;
    }
}