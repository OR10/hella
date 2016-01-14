<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;

/**
 * @Rest\Prefix("/api/statistics")
 * @Rest\Route(service="annostation.labeling_api.controller.api.statistics")
 *
 * @CloseSession
 */
class Statistics extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @param Facade\LabelingTask $taskFacade
     */
    public function __construct(Facade\LabelingTask $taskFacade)
    {
        $this->taskFacade = $taskFacade;
    }

    /**
     * @Rest\Get("/tasks")
     *
     * @return View\View
     */
    public function getTaskStatisticsAction()
    {
        $numberOfLabeledThings = $this->taskFacade->getTotalNumberOfLabeledThingsGroupedByTaskId();
        $totalTimesInSeconds   = $this->taskFacade->getTotalTimesGroupedByTaskId();

        $statistics = array_map(
            function($taskId) use ($numberOfLabeledThings, $totalTimesInSeconds) {
                return [
                    'taskId' => $taskId,
                    'numberOfLabeledThings' => isset($numberOfLabeledThings[$taskId])
                        ? $numberOfLabeledThings[$taskId]
                        : 0,
                    'totalTimeInSeconds' => isset($totalTimesInSeconds[$taskId])
                        ? $totalTimesInSeconds[$taskId]
                        : 0,
                ];
            },
            array_unique(array_merge(array_keys($numberOfLabeledThings), array_keys($totalTimesInSeconds)))
        );

        return View\View::create()->setData(['result' => $statistics]);
    }
}
