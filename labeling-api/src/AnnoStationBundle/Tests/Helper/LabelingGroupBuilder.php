<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;

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
    private $coordinators = [];

    /**
     * @return LabelingGroupBuilder
     */
    public static function create()
    {
        $labelingGroupBuilder = new self();

        return $labelingGroupBuilder;
    }

    public function withUsers(array $users)
    {
        $this->users = $users;

        return $this;
    }

    public function withCoordinators(array $coordinators)
    {
        $this->coordinators = $coordinators;

        return $this;
    }

    /**
     * @return Model\LabelingGroup
     */
    public function build()
    {
        $labelingGroup = Model\LabelingGroup::create($this->coordinators, $this->users);

        return $labelingGroup;
    }
}
