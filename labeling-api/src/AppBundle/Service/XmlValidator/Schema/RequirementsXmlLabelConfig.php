<?php
namespace AppBundle\Service\XmlValidator\Schema;

use AppBundle\Service\XmlValidator;

class RequirementsXmlLabelConfig implements XmlValidator\Schema
{
    /**
     * @return string
     */
    public function getSchemaFileName()
    {
        return __DIR__ . '/../../../Resources/XmlSchema/RequirementsXmlConfig.rng';
    }
}
