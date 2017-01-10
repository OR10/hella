<?php

namespace AnnoStationBundle\Service\LabelImporter\Parser;

use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\DataSource;

abstract class Base implements LabelImporter\Parser
{
    /**
     * @var LabelImporter\DataSource
     */
    protected $dataSource;

    /**
     * @param LabelImporter|DataSource $dataSource
     */
    public function __construct(DataSource $dataSource)
    {
        $this->dataSource = $dataSource;
    }
}