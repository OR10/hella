<?php

namespace AnnoStationBundle\Tests\Helper;

use AnnoStationBundle\Model;

/**
 * Helper class to create a Organisation.
 */
class OrganisationBuilder
{
    /**
     * @var string
     */
    private $name = 'Test Organisation';

    /**
     * @return OrganisationBuilder
     */
    public static function create()
    {
        $organisationBuilder = new self();

        return $organisationBuilder;
    }

    public function withName($name)
    {
        $this->name = $name;
    }

    /**
     * @return Model\Organisation
     */
    public function build()
    {
        $organisation = new Model\Organisation($this->name);

        return $organisation;
    }
}
