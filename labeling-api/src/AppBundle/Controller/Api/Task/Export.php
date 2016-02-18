<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.export")
 *
 * @CloseSession
 */
class Export extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\TaskExport
     */
    private $taskExportFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Facade\TaskExport   $taskExportFacade
     * @param AMQP\FacadeAMQP     $amqpFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskExport $taskExportFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->taskExportFacade   = $taskExportFacade;
        $this->amqpFacade         = $amqpFacade;
    }

    /**
     * @Rest\Get("/{task}/export")
     *
     * @param Model\LabelingTask $task
     */
    public function listExportsAction(Model\LabelingTask $task)
    {
        $exports = $this->taskExportFacade->findAllByTask($task);

        return View\View::create()->setData([
            'totalCount' => count($exports),
            'result'     => $exports,
        ]);
    }

    /**
     * @Rest\Get("/{taskId}/export/{taskExport}")
     *
     * @param string $taskId
     * @param Model\TaskExport $taskExport
     * @return HttpFoundation\Response
     */
    public function getExportAction($taskId, Model\TaskExport $taskExport)
    {
        if ($taskExport->getTaskId() !== $taskId) {
            throw new Exception\NotFoundHttpException('Requested export is not valid for this task');
        }

        return new HttpFoundation\Response(
            $taskExport->getRawData(),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => $taskExport->getContentType(),
                'Content-Disposition' => sprintf(
                    'attachment; filename="%s"',
                    $taskExport->getFilename()
                ),
            ]
        );
    }

    /**
     * @Rest\Post("/{task}/export/kitti")
     *
     * @param Model\LabelingTask $task
     *
     * @return HttpFoundation\Response
     */
    public function getKittiExportAction(Model\LabelingTask $task)
    {
        $this->amqpFacade->addJob(new Jobs\KittiExporter($task->getId()));

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData(['message' => 'Export started']);
    }
}
