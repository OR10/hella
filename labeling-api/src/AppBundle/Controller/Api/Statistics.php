<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use JMS\Serializer;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/statistics")
 * @Rest\Route(service="annostation.labeling_api.controller.api.statistics")
 *
 * @CloseSession
 */
class Statistics extends Controller\Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @param Facade\Video        $videoFacade
     * @param Facade\LabelingTask $taskFacade
     */
    public function __construct(Facade\Video $videoFacade, Facade\LabelingTask $taskFacade)
    {
        $this->videoFacade = $videoFacade;
        $this->taskFacade  = $taskFacade;
    }

    /**
     * @Rest\Get("/tasks")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function getTaskStatisticsAction(
        HttpFoundation\Request $request
    ) {
        $offset = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit  = $request->query->has('limit') ? $request->query->getInt('limit') : null;

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new Exception\BadRequestHttpException();
        }

        $tasks                 = $this->taskFacade->findAllEnabled(null, true, $offset, $limit);
        $videos                = $this->videoFacade->findAllForTasksIndexedById($tasks);
        $numberOfLabeledThings = $this->taskFacade->getTotalNumberOfLabeledThingsGroupedByTaskId($tasks);
        $totalTimesInSeconds   = $this->taskFacade->getTotalTimesGroupedByTaskId();

        $statistics = array_map(
            function(Model\LabelingTask $task) use ($numberOfLabeledThings, $totalTimesInSeconds, $videos) {
                $taskStatistics = new Model\TaskStatistics($videos[$task->getVideoId()], $task);

                if (isset($numberOfLabeledThings[$task->getId()])) {
                    $taskStatistics->setTotalNumberOfLabeledThings($numberOfLabeledThings[$task->getId()]);
                }

                if (isset($totalTimesInSeconds[$task->getId()])) {
                    $taskStatistics->setTotalLabelingTimeInSeconds($totalTimesInSeconds[$task->getId()]);
                }

                return $taskStatistics;
            },
            $tasks
        );

        return View\View::create()
            ->setSerializationContext(Serializer\SerializationContext::create()->setGroups(['statistics']))
            ->setData(['result' => $statistics]);
    }
}
