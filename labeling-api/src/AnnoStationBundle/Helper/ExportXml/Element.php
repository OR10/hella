<?php

namespace AnnoStationBundle\Helper\ExportXml;

/**
 * @SuppressWarnings(PHPMD.NumberOfChildren)
 */
abstract class Element
{
    /**
     * @param \DOMDocument $document
     *
     * @return mixed
     */
    abstract public function getElement(\DOMDocument $document);
}
