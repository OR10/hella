<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Helper;
use AnnoStationBundle\Helper\TaskConfigurationXmlConverter\RequirementsTaskConfigurationXmlConverter;
use AnnoStationBundle\Helper\TaskConfigurationXmlConverter\SimpleTaskConfigurationXmlConverter;
use AppBundle\Model;

class TaskConfigurationXmlConverterFactory
{
    /**
     * TaskConfigurationXmlConverterFactory constructor.
     */
    public function __construct()
    {
    }

    /**
     * Create a converter for a specific XML string
     *
     * @param                         $xml
     * @param                         $type
     *
     * @return RequirementsTaskConfigurationXmlConverter|SimpleTaskConfigurationXmlConverter
     */
    public function createConverter($xml, $type)
    {
        if ($type === Model\TaskConfiguration\SimpleXml::TYPE) {
            return new Helper\TaskConfigurationXmlConverter\SimpleTaskConfigurationXmlConverter($xml);
        }
        if ($type === Model\TaskConfiguration\RequirementsXml::TYPE) {
            return new Helper\TaskConfigurationXmlConverter\RequirementsTaskConfigurationXmlConverter($xml);
        }
    }
}
