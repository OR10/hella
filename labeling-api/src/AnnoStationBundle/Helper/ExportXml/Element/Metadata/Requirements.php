<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
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
        $requirements->setAttribute('filename', $this->taskConfiguration->getFilename());

        $sha256 = $document->createElementNS(
            $this->namespace,
            'sha256',
            hash('sha256', $this->taskConfiguration->getRawData())
        );

        $requirements->appendChild($sha256);

        return $requirements;
    }
}
