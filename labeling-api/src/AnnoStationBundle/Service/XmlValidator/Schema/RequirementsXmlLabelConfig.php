<?php
namespace AnnoStationBundle\Service\XmlValidator\Schema;

use AnnoStationBundle\Service\XmlValidator;

class RequirementsXmlLabelConfig implements XmlValidator\Schema
{
    /**
     * @return string
     */
    public function getSchemaFileName()
    {
        return __DIR__ . '/../../../Resources/XmlSchema/RequirementsXmlConfigWithFrameLabeling.rng';
    }
}
