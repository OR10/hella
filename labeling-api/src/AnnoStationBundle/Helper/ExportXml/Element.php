<?php

namespace AnnoStationBundle\Helper\ExportXml;

abstract class Element
{
    /**
     * @param \DOMDocument $document
     *
     * @return mixed
     */
    abstract public function getElement(\DOMDocument $document);
}
