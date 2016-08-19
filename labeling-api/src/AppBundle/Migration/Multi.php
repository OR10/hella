<?php
namespace AppBundle\Migration;

use Doctrine\ODM\CouchDB\Migrations;

class Multi implements Migrations\DocumentMigration
{
    private $migrations;

    public function __construct(array $migrations)
    {
        $this->migrations = $migrations;
    }

    public function migrate(array $data)
    {
        $currentData = $data;
        foreach ($this->migrations as $migration) {
            $currentData = $migration->migrate($currentData);
        }
        return $currentData;
    }
}
