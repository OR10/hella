<?php

namespace AnnoStationBundle\Helper\IncompleteClassesChecker;

use AppBundle\Model;
use AnnoStationBundle\Helper;

class Legacy extends Helper\ClassesStructure
{
    /**
     * @var array
     */
    private $labelStructure;

    public function __construct($labelStructure)
    {

        $this->labelStructure = $labelStructure;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return array
     */
    public function getLabeledThingInFrameStructure(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $classes = [];
        foreach ($this->labelStructure['children'] as $child) {
            $values = [];
            foreach ($child['children'] as $value) {
                if (isset($value['children'])) {
                    $values[] = [
                        'name'     => $value['name'],
                        'children' => $this->getChildrenStructure($value['children']),
                    ];
                } else {
                    $values[] = ['name' => $value['name']];
                }
            }
            $classes[] = $values;
        }

        return $classes;
    }

    /**
     * @param $children
     *
     * @return array
     */
    private function getChildrenStructure($children)
    {
        $values = [];
        foreach ($children as $value) {
            if (isset($value['children'])) {
                $values[] = [
                    'name'     => $value['name'],
                    'children' => $this->getChildrenStructure($value['children']),
                ];
            } else {
                $values[] = ['name' => $value['name']];
            }
        }

        return [$values];
    }
}
