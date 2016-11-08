<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;
use AppBundle\Model\Project;
use AppBundle\Response;

class ProjectListResponseBuilder
{
    /**
     * @var array
     */
    private $projects = [];

    /**
     * @var Model\User[]
     */
    private $users = [];

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
        $users = new Response\SimpleUsers($this->users);

        return [
            'totalRows' => count($this->projects),
            'result' => $this->projects,
            'users' => $users->getResult(),
        ];
    }
}
