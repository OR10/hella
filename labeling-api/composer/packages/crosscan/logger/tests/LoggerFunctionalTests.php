<?php
class cscntLoggerFunctionalTests extends PHPUnit_Framework_TestCase
{
    public function testInfoAndErrorWriting()
    {
        $logger = new cscntLogger();

        $infoLogFile  = tempnam( sys_get_temp_dir(), 'loggerFunctional' );
        $errorLogFile  = tempnam( sys_get_temp_dir(), 'loggerFunctional' );
        $logger->options->writers['file.info'] = new cscntLogFileWriter(
            $infoLogFile
        );
        $logger->options->writers['file.error'] = new cscntLogFileWriter(
            $errorLogFile
        );

        $logger->options->routes[] = new cscntLogSeverityFilter(
            cscntLogPayload::SEVERITY_INFO,
            array( 'file.info' )
        );
        $logger->options->routes[] = new cscntLogSeverityFilter(
            cscntLogPayload::SEVERITY_ERROR,
            array( 'file.error' )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_INFO,
                cscntLogFacility::MONITORING,
                null,
                "Test info"
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_ERROR,
                cscntLogFacility::MONITORING,
                null,
                "Test error"
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_INFO,
                cscntLogFacility::MONITORING,
                null,
                "Test info"
            )
        );

        $infoLog = file_get_contents( $infoLogFile );
        $errorLog = file_get_contents( $errorLogFile );

        unlink( $infoLogFile );
        unlink( $errorLogFile );

        $this->assertRegExp(
            '(\A[A-Za-z]{3} [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} <Info> \[.*\] monitoring: Test info\n[A-Za-z]{3} [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} <Error> \[.*\] monitoring: Test error\n[A-Za-z]{3} [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} <Info> \[.*\] monitoring: Test info\n\Z)',
            $infoLog
        );

        $this->assertRegExp(
            '(\A[A-Za-z]{3} [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} <Error> \[.*\] monitoring: Test error\n\Z)',
            $errorLog
        );
    }

    public function testAndRoutePayloadBufferCleanupEndlessLoopRegression()
    {
        $logger = new cscntLogger();

        $logFile  = tempnam( sys_get_temp_dir(), 'loggerFunctional' );
        $logger->options->writers['file.info'] = new cscntLogFileWriter(
            $logFile
        );

        $logger->options->routes[] = new cscntLogAndRoute(
            array(
                new cscntLogSeverityFilter(
                    cscntLogPayload::SEVERITY_WARNING,
                    array( 'file.info' )
                ),
                new cscntLogFacilityFilter(
                    cscntLogFacility::MONITORING,
                    array( 'file.info' )
                )
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_INFO,
                cscntLogFacility::MONITORING,
                null,
                "Test info"
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_INFO,
                cscntLogFacility::MONITORING,
                null,
                "Test info"
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_ERROR,
                cscntLogFacility::MONITORING,
                null,
                "Test error"
            )
        );

        $logger->log(
            new cscntLogStringPayload(
                cscntLogPayload::SEVERITY_INFO,
                cscntLogFacility::MONITORING,
                null,
                "Test info"
            )
        );

        $log = file_get_contents( $logFile );

        unlink( $logFile );

        $this->assertRegExp(
            '(\A[A-Za-z]{3} [0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2} <Error> \[.*\] monitoring: Test error\n\Z)',
            $log
        );
    }


    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
