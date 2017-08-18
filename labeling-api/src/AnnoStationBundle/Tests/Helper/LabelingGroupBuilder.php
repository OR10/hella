<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * Helper class to create LabelingGroup.
 */
class LabelingGroupBuilder
{
    /**
     * @var array
     */
    private $users = [];

    /**
     * @var array
     */
    private $labelManagers = [];

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return LabelingGroupBuilder
     */
    public static function create(AnnoStationBundleModel\Organisation $organisation)
    {
        $labelingGroupBuilder = new self();
        $labelingGroupBuilder->organisation = $organisation;

        return $labelingGroupBuilder;
    }

    public function withUsers(array $users)
    {
        $this->users = $users;

        return $this;
    }

    public function withLabelManagers(array $labelManagers)
    {
        $this->labelManagers = $labelManagers;

        return $this;
    }

    /**
     * @return Model\LabelingGroup
     */
    public function build()
    {
        $labelingGroup = Model\LabelingGroup::create($this->organisation, $this->labelManagers, $this->users);

        return $labelingGroup;
    }
}
