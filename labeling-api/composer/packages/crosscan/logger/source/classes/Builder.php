<?php

namespace crosscan\Logger;

class Builder
{
    /**
     * Creates a logger instance with the given default config. The logger will then be configured to write all stuff
     * to the given logfile if it is greater than the given severity.
     * This can optionally also be configured to log with the same mechanism to a graylog host, given the
     * graylogHostname and the minimum severity for the graylog host.
     *
     * @param string $logfileName
     * @param int $logMinSeverity the default parameter is cscntLogPayload::SEVERITY_DEBUG
     * @param string|null $gelfHost
     * @param int $gelfMinSeverity the default parameter is cscntLogPayload::SEVERITY_DEBUG
     * @return \cscntLogger
     */
    public function createPreconfiguredLogger(
        $logfileName,
        $logMinSeverity = 10,
        $gelfHost = null,
        $gelfMinSeverity = 10
    ) {
        $logger                              = new \cscntLogger();
        $logger->options->writers['default'] = new \cscntLogFileWriter($logfileName);
        $logger->options->routes[]           = new \cscntLogSeverityFilter($logMinSeverity, array('default'));

        if ($gelfHost !== null) {
            $gelfPublisher = new \Gelf\Publisher(
                new \Gelf\Transport\UdpTransport(
                    $gelfHost
                )
            );
            $logger->options->writers['graylog'] = new \cscntLogGelfWriter($gelfPublisher);
            $logger->options->routes[]           = new \cscntLogSeverityFilter($gelfMinSeverity, array('graylog'));
        }

        return $logger;
    }
}
