<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Service\Exporter\RequirementsProjectToXml;
use AppBundle\Model;

class Requirements extends ExportXml\Element
{
    /**
     * @var Model\TaskConfiguration
     */
    private $taskConfiguration;

    /**
     * @var
     */
    private $namespace;

    public function __construct(Model\TaskConfiguration $taskConfiguration, $namespace)
    {
        $this->taskConfiguration = $taskConfiguration;
        $this->namespace         = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $requirements = $document->createElementNS($this->namespace, 'requirements');

        $requirements->setAttribute('id', $this->taskConfiguration->getId());
        $requirements->setAttribute('name', $this->taskConfiguration->getName());
        $filename           = sprintf(
            '%s.%s.%s',
            basename($this->getFilename($this->taskConfiguration->getFilename()), '.xml'),
            RequirementsProjectToXml::REQUIREMENTS_XML_POSTFIX,
            'xml'
        );
        $requirements->setAttribute('filename', $filename);

        $sha256 = $document->createElementNS(
            $this->namespace,
            'sha256',
            hash('sha256', $this->taskConfiguration->getRawData())
        );

        $requirements->appendChild($sha256);

        return $requirements;
    }

    /**
     * @param $filename
     *
     * @return mixed
     */
    private function getFilename($filename)
    {
        $search   = ['ä', 'ü', 'ü', 'ö', 'Ä', 'Ü', 'Ö']; // ü is not the same as ü
        $replace  = ['ae', 'ue', 'ue', 'oe', 'Ae', 'Üe', 'Oe'];
        $filename = str_replace($search, $replace, $filename);

        return $filename;
    }
}
