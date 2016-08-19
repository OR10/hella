<?php
namespace AppBundle\Service\XmlValidator\Schema;

use AppBundle\Service\XmlValidator;

class SimpleXmlLabelConfig implements XmlValidator\Schema
{
    /**
     * @return string
     */
    public function getSchemaFileName()
    {
        return __DIR__ . '/../../../Resources/XmlSchema/SimpleXmlLabelConfig.xsd';
    }
}
