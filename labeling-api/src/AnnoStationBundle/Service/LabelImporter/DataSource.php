<?php

namespace AnnoStationBundle\Service\LabelImporter;

use AnnoStationBundle\Service\LabelImporter\DataSource\Exception;

/**
 * Provides access to a raw source
 */
interface DataSource
{
    /**
     * @throws Exception\InaccessibleDataSourceException
     * @return string
     */
    public function getContents();
}