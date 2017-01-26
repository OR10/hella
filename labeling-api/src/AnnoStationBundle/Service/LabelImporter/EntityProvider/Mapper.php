<?php

namespace AnnoStationBundle\Service\LabelImporter\EntityProvider;

use AnnoStationBundle\Service\LabelImporter;

class Mapper implements LabelImporter\EntityProvider
{
    /**
     * @var array
     */
    private $mappingRules;

    /**
     * @param array $mappingRules
     */
    public function __construct(array $mappingRules)
    {
        $this->mappingRules = $mappingRules;
    }

    /**
     * @param LabelImporter\Parser $parser
     *
     * @return array
     */
    public function getEntities(LabelImporter\Parser $parser)
    {
        $entities = [];
        foreach ($parser->parseDataSource() as $label) {
            $entities[] = $this->mapLabelData($label);
        }

        return $entities;
    }

    /**
     * @param $labelData
     *
     * @return array
     */
    private function mapLabelData($labelData)
    {
        $entity = [];

        foreach ($this->mappingRules['fields'] as $field => $rule) {
            if (isset($rule['mapKey']) && is_string($rule['mapKey'])) {
                $entity[$field] = $labelData[$rule['mapKey']];
            }

            if (isset($rule['mapKeyStart'])) {
                $entity[$field] = array_values(
                    array_slice(
                        $labelData,
                        $rule['mapKeyStart'],
                        count($labelData) - $rule['mapKeyStart']
                    )
                );
            }
        }

        return $entity;
    }
}
