<?php

namespace AnnoStationBundle\Service\LabelImporter;

use AnnoStationBundle\Service\LabelImporter;

interface EntityProvider
{
    /**
     * @param Parser $parser
     *
     * @return array
     */
    public function getEntities(LabelImporter\Parser $parser);
}
