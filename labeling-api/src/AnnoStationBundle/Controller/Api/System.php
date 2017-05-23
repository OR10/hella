<?php

namespace AnnoStationBundle\Controller\Api;

use GuzzleHttp;
use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpKernel\Exception;
use AnnoStationBundle\Service\Authentication;

/**
 * @Rest\Prefix("/api/system")
 * @Rest\Route(service="annostation.labeling_api.controller.api.system")
 *
 * @CloseSession
 */
class System extends Controller\Base
{
    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

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

    public function __construct(
        Authentication\UserPermissions $userPermissions,
        GuzzleHttp\Client $guzzleClient,
        $amqpHost,
        $amqpManagmentPort,
        $amqpUsername,
        $amqpPassword
    ) {

        $this->userPermissions   = $userPermissions;
        $this->guzzleClient      = $guzzleClient;
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
     * @return \FOS\RestBundle\View\View
     */
    public function queuedMessagesAction()
    {
        if (!$this->userPermissions->hasPermission('canCreateOrganisation')) {
            throw new Exception\AccessDeniedHttpException();
        }

        $res    = $this->guzzleClient->request(
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
            if ($queue['vhost'] === '/' || $queue['vhost'] === '/annostation') {
                $queuedMessages[$queue['name']] = $queue['messages'];
            }
        }

        return View\View::create()->setData(['result' => $queuedMessages]);
    }
}
