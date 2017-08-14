<?php

namespace crosscan\Std\TestCase\Helper;

use Doctrine\ORM;

class Mysql
{
    /**
     * @var ORM\EntityManager
     */
    private $entityManager;

    /**
     * create a new mysql importer
     *
     * @param \PHPUnit_Framework_TestCase $test reference to the test case
     * currently being executed. this will be used in order to mark a test as
     * skipped if not in test environment
     * @param \Doctrine\ORM\EntityManager $entityManager
     */
    public function __construct(\PHPUnit_Framework_TestCase $test, ORM\EntityManager $entityManager)
    {
        $this->test          = $test;
        $this->entityManager = $entityManager;
    }

    /**
     * import the given file to the previously configured database
     *
     * @param string $filename
     */
    public function importFile($filename)
    {
        $this->entityManager->getConnection()->query(file_get_contents($filename));
    }

    /**
     * Deletes all tables in the given database. THIS MIGHT CAUSE SERIOUS DAMAGE!
     */
    public function deleteAllTables()
    {
        $stmt = $this->entityManager->getConnection()->query('SHOW TABLES');

        $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        if (count($tables) > 35) {
            $this->test->markTestSkipped('Not in test environment, more than ' . count($tables) . ' tables exist.');
        }

        foreach ($tables as $table) {
            $this->entityManager->getConnection()->executeUpdate('DROP TABLE ' . $table);
        }
    }
}