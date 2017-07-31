<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Model;

class AdditionalFrameNumberMapping extends ExportXml\Element
{
    /**
     * @var Model\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMapping;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Model\AdditionalFrameNumberMapping $additionalFrameNumberMapping, $namespace)
    {
        $this->namespace                    = $namespace;
        $this->additionalFrameNumberMapping = $additionalFrameNumberMapping;
    }

    public function getElement(\DOMDocument $document)
    {
        $requirements = $document->createElementNS($this->namespace, 'additional-frame-number-mapping');

        $requirements->setAttribute('id', $this->additionalFrameNumberMapping->getId());
        $requirements->setAttribute('filename', $this->additionalFrameNumberMapping->getFilename());

        $sha256 = $document->createElementNS(
            $this->namespace,
            'sha256',
            hash('sha256', $this->additionalFrameNumberMapping->getAttachment())
        );

        $requirements->appendChild($sha256);

        return $requirements;
    }
}
