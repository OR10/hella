<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model\Project;

class ProjectListResponseBuilder
{
    /**
     * @var array
     */
    private $projects = [];

    /**
     * We declare a private constructor to enforce usage of factory methods and fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return ProjectListResponseBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param array $projects
     *
     * @return $this
     */
    public function withProjects(array $projects)
    {
        $this->projects = $projects;

        return $this;
    }

    /**
     * @return array
     */
    public function build()
    {
        return ['totalRows' => count($this->projects), 'result' => $this->projects];
    }
}