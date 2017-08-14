<?php

/**
 * crosscan connect Logger testsuire
 */
class cscntLoggerTestSuite extends PHPUnit_Framework_TestSuite
{
    public function __construct()
    {
        parent::__construct();        
        
        $this->setName('Logger');
        $this->addTestSuite(cscntLoggerInstanceTests::suite());
        $this->addTestSuite(cscntLoggerOptionsTests::suite());
        $this->addTestSuite(cscntLoggerCollectionTests::suite());
        $this->addTestSuite(cscntLoggerWriterCollectionTests::suite());
        $this->addTestSuite(cscntLoggerPayloadTests::suite());
        $this->addTestSuite(cscntLoggerTests::suite());
        $this->addTestSuite(cscntLoggerFilterTests::suite());
        $this->addTestSuite(cscntLoggerFilePayloadTests::suite());
        $this->addTestSuite(cscntLoggerJsonPayloadTests::suite());
        $this->addTestSuite(cscntLoggerStringPayloadTests::suite());
        $this->addTestSuite(cscntLoggerExceptionPayloadTests::suite());
        $this->addTestSuite(cscntLoggerAndRouteTests::suite());
        $this->addTestSuite(cscntLoggerOrRouteTests::suite());
        $this->addTestSuite(cscntLoggerSeverityFilterTests::suite());
        $this->addTestSuite(cscntLoggerFacilityFilterTests::suite());
        $this->addTestSuite(cscntLoggerSeverityGroupFilterTests::suite());
        $this->addTestSuite(cscntLoggerFacilityGroupFilterTests::suite());
        $this->addTestSuite(cscntLoggerFileWriterTests::suite());
        $this->addTestSuite(cscntLoggerDirectoryWriterTests::suite());
        $this->addTestSuite(cscntLoggerCouchDBWriterTests::suite());
        $this->addTestSuite(cscntLoggerFunctionalTests::suite());
    }

    public static function suite()
    {
        return new cscntLoggerTestSuite(__CLASS__);
    }
}
