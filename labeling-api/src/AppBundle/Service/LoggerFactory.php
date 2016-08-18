<?php

namespace AppBundle\Service;

use Gelf;

/**
 * Used only by symfony itself to create a cscntLogger-instance
 */
class LoggerFactory
{
    /**
     * @param string      $filename the filename to log to
     * @param string|null $graylogHost
     * @param int         $severity the minimum severity to log
     *
     * @return \cscntLogger
     */
    public static function createLogger($filename, $graylogHost, $severity = 0)
    {
        $logger = new \cscntLogger();

        $logger->options->writers['filelog'] = new \cscntLogFileWriter($filename);
        $logger->options->routes[]           = new \cscntLogSeverityFilter($severity, array('filelog'));

        if ($graylogHost !== null) {
            $gelfPublisher = new Gelf\MessagePublisher($graylogHost);

            $logger->options->writers['gelf'] = new \cscntLogGelfWriter($gelfPublisher);
            $logger->options->routes[]        = new \cscntLogSeverityFilter($severity, array('gelf'));
        }

        return $logger;
    }
}
