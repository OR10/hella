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
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
     * @param HttpFoundation\Request      $request
     * @param AppBundleModel\LabelingTask $task
     *
     * @return View\View
     */
    public function postLabeledThingGroupAction(HttpFoundation\Request $request, AppBundleModel\LabelingTask $task)
    {
        $groupType = $request->request->get('groupType');
        $groupIds  = $request->request->get('groupIds');

        if (($lineColor = $request->request->get('lineColor')) === null) {
            throw new BadRequestHttpException('Missing lineColor');
        }

        $labeledThingGroup = new Model\LabeledThingGroup($task, $lineColor, $groupType, $groupIds);

        $this->labeledThingGroupFacade->save($labeledThingGroup);

        return View\View::create()->setData(['result' => $labeledThingGroup]);
    }

    /**
     * @Rest\GET("/{task}/labeledThingGroupInFrame/frame/{frameIndex}")
     *
     * @param AppBundleModel\LabelingTask $task
     * @param                             $frameIndex
     *
     * @return View\View
     */
    public function getLabeledThingGroupAction(AppBundleModel\LabelingTask $task, $frameIndex)
    {
        $groupsInFrame = $this->labeledThingGroupFacade->getLabeledThingGroupByTaskAndFrameIndex(
            $task,
            $frameIndex
        );

        $labeledThingInFrames = [];
        $labeledThingGroups   = [];
        foreach ($groupsInFrame as $groupInFrame) {
            $labeledThingGroupInFrame = new Model\LabeledThingGroupInFrame($groupInFrame, $frameIndex);
            $labeledThingGroupInFrame->setId($this->guidv4(random_bytes(16)));

            $labeledThingInFrames[$groupInFrame . '-' . $frameIndex] = $labeledThingGroupInFrame;
            $labeledThingGroups[$groupInFrame]                       = $this->labeledThingGroupFacade->find(
                $groupInFrame
            );
        }

        return View\View::create()->setData(
            [
                'result' => [
                    'labeledThingGroupsInFrame' => array_values($labeledThingInFrames),
                    'labeledThingGroups'        => array_values($labeledThingGroups),
                ],
            ]
        );
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

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    private function guidv4($data)
    {
        assert(strlen($data) == 16);

        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
