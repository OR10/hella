<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.replication")
 *
 * @CloseSession
 */
class Replication extends Controller\Base
{
    /**
     * @var string
     */
    private $couchDbExternalUrl;

    public function __construct($couchDbExternalUrl)
    {
        $this->couchDbExternalUrl = $couchDbExternalUrl;
    }

    /**
     * @Rest\Get("/{task}/replication")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return View\View
     */
    public function getReplicationDatabaseAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        $databaseName = sprintf('taskdb-project-%s-task-%s', $task->getProjectId(), $task->getId());

        return View\View::create()->setData(
            [
                'result' => [
                    'taskId'         => $task->getId(),
                    'databaseName'   => $databaseName,
                    'databaseServer' => $this->couchDbExternalUrl,
                ],
            ]
        );
    }
}