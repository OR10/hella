<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.labeled_thing_group")
 *
 * @CloseSession
 */
class LabeledThingGroup extends Controller\Base
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @param Facade\LabeledThingGroup $labeledThingGroupFacade
     */
    public function __construct(Facade\LabeledThingGroup $labeledThingGroupFacade)
    {
        $this->labeledThingGroupFacade = $labeledThingGroupFacade;
    }

    /**
     * @Rest\POST("/{task}/labeledThingGroup")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function postLabeledThingGroupAction(HttpFoundation\Request $request)
    {
        $groupType = $request->request->get('groupType');
        $groupIds  = $request->request->get('groupIds');

        $labeledThingGroup = new Model\LabeledThingGroup($groupType, $groupIds);

        $this->labeledThingGroupFacade->save($labeledThingGroup);

        return View\View::create()->setData(['result' => $labeledThingGroup]);
    }

    /**
     * @Rest\GET("/{task}/labeledThingGroupInFrame/frame/{frameIndex}")
     *
     * @param AppBundleModel\LabelingTask     $task
     * @param                        $frameIndex
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getLabeledThingGroupAction(AppBundleModel\LabelingTask $task, $frameIndex)
    {
        $groupsInFrame = $this->labeledThingGroupFacade->getLabeledThingGroupByTaskAndFrameIndex(
            $task,
            $frameIndex
        );

        $labeledThingInFrames= [];
        foreach($groupsInFrame as $groupInFrame) {
            $labeledThingGroupInFrame = new Model\LabeledThingGroupInFrame($frameIndex);
            $labeledThingGroupInFrame->setId('11111111-0000-0000-0000-111111111111');

            $labeledThingInFrames[] = $labeledThingGroupInFrame;

        }

        return View\View::create()->setData(['result' => $labeledThingInFrames]);
    }

    /**
     * @Rest\Delete("/{task}/labeledThingGroup/{labeledThingGroup}")
     *
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return View\View
     */
    public function deleteLabeledThingGroupAction(
        Model\LabeledThingGroup $labeledThingGroup
    ) {
        $this->labeledThingGroupFacade->delete($labeledThingGroup);

        return View\View::create()->setData(['success' => true]);
    }
}