<?php

namespace crosscan\Std\TestCase;

use Doctrine\ORM;
use crosscan\Std\TestCase\Helper;

abstract class Symfony extends \PHPUnit_Framework_TestCase
{
    /**
     * @var \Doctrine\DBAL\Connection
     */
    protected $connection;

    /**
     * @var ORM\EntityManager
     */
    protected $entityManager;

    /**
     * @var MysqlImporter
     */
    protected $mysqlImporter;

    /**
     * @var string[]
     */
    protected $mysqlFiles = array();

    /**
     * @var \AppKernel
     */
    protected $kernel;

    /**
     * Beware that this method is final! If you need your own setUp for your test implement the method
     * setUpImplementation!
     * This method will boot the symfony kernel and create a doctrine entitymanager. Then it calls
     * $this->setUpImplementation()
     * and will afterwards import all mysql files added using addMysqlFile in the same order as they were added.
     */
    protected final function setUp()
    {
        $this->kernel = new \AppKernel('test', true);
        $this->kernel->boot();

        $this->entityManager = $this->kernel->getContainer()
            ->get('doctrine')
            ->getManager();

        $this->connection = $this->kernel->getContainer()->get('doctrine')->getConnection();

        $this->mysqlImporter = new Helper\Mysql($this, $this->entityManager);
        $this->setUpImplementation();
        $this->importMysqlFiles();
    }


    /**
     * if you need to prepare mysql for your test you can call $this->addMysqlFile($filename) as often as you like
     * in this method. The mysql files will be imported befor and all tables dropped after execution of each test.
     */
    protected function setUpImplementation()
    {
    }

    /**
     * Adds a file to the list of files which will be imported during setUp().
     * You have to add those files in your implementation of setUpImplementation.
     *
     * @param $filename
     */
    protected function addMysqlFile($filename)
    {
        $this->mysqlFiles[] = $filename;
    }

    private function importMysqlFiles()
    {
        foreach ($this->mysqlFiles as $file) {
            $this->mysqlImporter->importFile($file);
        }
    }

    /**
     * Beware that this method is final!
     *
     * This implementation will clear the list of mysql files to be imported during setUp and drop all tables
     * from the testdatabase.
     * Afterwards it calls $this->tearDownImplementation()
     *
     * override tearDownImplementation() if your testcase needs its own tearDown implementation
     */
    protected final function tearDown()
    {
        $this->mysqlFiles = array();
        $this->mysqlImporter->deleteAllTables();
        $this->tearDownImplementation();
    }

    protected function tearDownImplementation()
    {
    }
}