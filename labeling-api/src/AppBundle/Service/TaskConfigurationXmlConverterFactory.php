<?php

namespace AppBundle\Service;

use AppBundle\Helper;

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
     * @param string $xml
     *
     * @return Helper\TaskConfigurationXmlConverter
     */
    public function createConverter($xml)
    {
        return new Helper\TaskConfigurationXmlConverter($xml);
    }
}
