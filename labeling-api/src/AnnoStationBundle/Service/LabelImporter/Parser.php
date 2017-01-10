<?php

namespace AnnoStationBundle\Service\LabelImporter;

interface Parser
{
    /**
     * Parses a DataSource and returns the result
     *
     * @return array(string)
     */
    public function parseDataSource();
}