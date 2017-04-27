<?php
namespace AnnoStationBundle\Service\XmlValidator\Schema;

use AnnoStationBundle\Service\XmlValidator;

class RequirementsXmlLabelConfig implements XmlValidator\Schema
{
    /**
     * @var bool
     */
    private $pouchDbEnabled;

    public function __construct($pouchDbEnabled)
    {
        $this->pouchDbEnabled = $pouchDbEnabled;
    }

    /**
     * @return string
     */
    public function getSchemaFileName()
    {
        if ($this->pouchDbEnabled) {
            return __DIR__ . '/../../../Resources/XmlSchema/RequirementsXmlConfigWithFrameLabeling.rng';
        }
        return __DIR__ . '/../../../Resources/XmlSchema/RequirementsXmlConfig.rng';
    }
}
