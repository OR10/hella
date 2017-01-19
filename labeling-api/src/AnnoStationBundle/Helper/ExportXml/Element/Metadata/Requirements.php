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

    public function __construct(Model\TaskConfiguration $taskConfiguration)
    {
        $this->taskConfiguration = $taskConfiguration;
    }

    public function getElement(\DOMDocument $document)
    {
        $requirements = $document->createElement('requirements');

        $requirements->setAttribute('id', $this->taskConfiguration->getId());
        $requirements->setAttribute('name', $this->taskConfiguration->getName());

        $sha256 = $document->createElement(
            'sha256',
            hash('sha256', $this->taskConfiguration->getRawData())
        );

        $requirements->appendChild($sha256);

        return $requirements;
    }
}