<?php

namespace AppBundle\Service\Monitoring\Check;

use ZendDiagnostics\Check;
use ZendDiagnostics\Result;
use ZendDiagnostics\Result\ResultInterface;
use GuzzleHttp;

/**
 * Check implementation which checks the fill level of a given RabbitMQ queue.
 */
class RabbitMqQueueFillLevel implements Check\CheckInterface
{
    /**
     * @var string
     */
    private $host;

    /**
     * @var string
     */
    private $port;

    /**
     * @var string
     */
    private $vhost;

    /**
     * @var string
     */
    private $queueName;

    /**
     * @var string
     */
    private $username;

    /**
     * @var string
     */
    private $password;

    /**
     * @var int
     */
    private $maxFillLevel;

    /**
     * @param string $host
     * @param string $port
     * @param string $vhost
     * @param string $username
     * @param string $password
     * @param string $queueName
     * @param string $maxFillLevel
     */
    public function __construct(
        string $host,
        string $port,
        string $vhost,
        string $username,
        string $password,
        string $queueName,
        string $maxFillLevel
    ) {
        $this->host         = $host;
        $this->port         = $port;
        $this->vhost        = $vhost;
        $this->username     = $username;
        $this->password     = $password;
        $this->queueName    = $queueName;
        $this->maxFillLevel = (int) $maxFillLevel;
    }

    /**
     * Perform the actual check and return a ResultInterface
     *
     * @return ResultInterface
     */
    public function check()
    {
        $httpClient = new GuzzleHttp\Client();

        $url = sprintf(
            'http://%s:%s/api/queues/%s/%s',
            $this->host,
            $this->port,
            urlencode($this->vhost),
            urlencode($this->queueName)
        );

        $response = $httpClient->request('GET', $url, [
            'auth' => [$this->username, $this->password]
        ]);

        $queueStatus = json_decode($response->getBody());

        if ($queueStatus->messages > $this->maxFillLevel) {
            return new Result\Failure(
                sprintf(
                    'Expected max fill level of %d, but was %d',
                    $this->maxFillLevel,
                    $queueStatus->messages
                )
            );
        }

        return new Result\Success();
    }

    /**
     * Return a label describing this test instance.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'RabbitMQ queue fill level ' . $this->queueName;
    }
}
