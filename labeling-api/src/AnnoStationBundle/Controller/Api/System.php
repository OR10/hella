<?php

namespace AnnoStationBundle\Controller\Api;

use GuzzleHttp;
use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Rest\Prefix("/api/system")
 * @Rest\Route(service="annostation.labeling_api.controller.api.system")
 *
 * @CloseSession
 */
class System extends Controller\Base
{
    /**
     * @var string
     */
    private $amqpHost;
    /**
     * @var string
     */
    private $amqpManagmentPort;
    /**
     * @var string
     */
    private $amqpUsername;
    /**
     * @var string
     */
    private $amqpPassword;

    public function __construct($amqpHost, $amqpManagmentPort, $amqpUsername, $amqpPassword)
    {

        $this->amqpHost          = $amqpHost;
        $this->amqpManagmentPort = $amqpManagmentPort;
        $this->amqpUsername      = $amqpUsername;
        $this->amqpPassword      = $amqpPassword;
    }

    /**
     * This method returns the current number of queued RabbitMQ messages
     *
     * @Rest\Get("/queues")
     *
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @return \FOS\RestBundle\View\View
     */
    public function queuedMessagesAction()
    {
        $client = new GuzzleHttp\Client();
        $res    = $client->request(
            'GET',
            sprintf(
                'http://%s:%s/api/queues',
                $this->amqpHost,
                $this->amqpManagmentPort
            ),
            [
                'auth' => [$this->amqpUsername, $this->amqpPassword],
            ]
        );

        $queues = json_decode($res->getBody(), true);

        $queuedMessages = [];
        foreach ($queues as $queue) {
            if ($queue['vhost'] === '/annostation') {
                $queuedMessages[$queue['name']] = $queue['messages'];
            }
        }

        return View\View::create()->setData(['result' => $queuedMessages]);
    }
}
