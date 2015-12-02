<?php

namespace AppBundle\Controller\Api\Task;

use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool\AMQP;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.interpolate")
 */
class Interpolate extends Controller\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\Status
     */
    private $statusFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Facade\LabeledThing $labeledThingFacade
     * @param AMQP\FacadeAMQP     $amqpFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\Status $statusFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->labeledThingFacade = $labeledThingFacade;
        $this->statusFacade       = $statusFacade;
        $this->amqpFacade         = $amqpFacade;
    }

    /**
     * TODO: add support for offset/limit to restrict the frame range
     *
     * @Rest\Post("/{task}/interpolate/{labeledThing}")
     *
     * @param Model\LabelingTask     $task
     * @param Model\LabeledThing     $labeledThing
     * @param HttpFoundation\Request $request
     */
    public function startInterpolationAction(
        Model\LabelingTask $task,
        Model\LabeledThing $labeledThing,
        HttpFoundation\Request $request
    ) {
        $this->closeSession();

        if ($labeledThing->getTaskId() !== $task->getId()) {
            throw new Exception\BadRequestHttpException();
        }

        if (($algorithm = $request->request->get('type')) === null) {
            throw new Exception\BadRequestHttpException();
        }

        $status = new Model\Interpolation\Status();
        $this->statusFacade->save($status);
        $job = new Jobs\Interpolation($labeledThing->getId(), $algorithm, $labeledThing->getFrameRange(), $status);
        $this->amqpFacade->addJob($job);

        return View\View::create()
            ->setStatusCode(HttpFoundation\Response::HTTP_ACCEPTED)
            ->setData([
                'result' => [
                    'id' => $status->getId(),
                    'type' => str_replace('\\', '.', Model\Interpolation\Status::class),
                ]
            ]);
    }
}
