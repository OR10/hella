<?php

namespace AppBundle\Controller\Api\Task;

use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.export")
 */
class Export extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\TaskExporter\Kitti
     */
    private $kittiExporter;

    /**
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Service\TaskExporter\Kitti $kittiExporter
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Service\TaskExporter\Kitti $kittiExporter)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->kittiExporter      = $kittiExporter;
    }

    /**
     * @Rest\Get("/{taskId}/export/kitti")
     *
     * @param string $taskId
     *
     * @return HttpFoundation\Response
     */
    public function getKittiExportAction($taskId)
    {
        $task = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            throw new Exception\NotFoundHttpException();
        }

        $data = $this->kittiExporter->exportLabelingTask($task);

        return new HttpFoundation\Response(
            $data,
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => 'application/zip',
                'Content-Disposition' => sprintf(
                    'attachment; filename="%s.zip"',
                    'kitti-export'
                ),
            ]
        );
    }
}
