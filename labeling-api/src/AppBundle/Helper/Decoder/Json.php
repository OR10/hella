<?php
namespace AppBundle\Helper\Decoder;

use FOS\RestBundle\Decoder;
use crosscan\Logger\Facade\LoggerFacade;

class Json implements Decoder\DecoderInterface
{
    /**
     * @var \cscntLogger
     */
    private $loggerFacade;

    /**
     * @param \cscntLogger $logger
     */
    public function __construct(\cscntLogger $logger)
    {
        $this->loggerFacade = new LoggerFacade($logger, self::class);
    }

    public function decode($data)
    {
        $return = \json_decode($data, true);

        if ($return === null) {
            $this->loggerFacade->logString(
                sprintf("Failed to decode json: \n%s", $data),
                \cscntLogPayload::SEVERITY_DEBUG
            );

            return [];
        }

        return $return;
    }
}
