<?php
namespace AppBundle\Tests;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use FOS\UserBundle\Util\UserManipulator;

class CouchDbTestCase extends Tests\WebTestCase
{
    /**
     * @var Facade\Video
     */
    protected $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    protected $labelingTaskFacade;

    /**
     * @var Facade\Project
     */
    protected $projectFacade;

    /**
     * @var Facade\LabeledThing
     */
    protected $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    protected $labeledThingInFrameFacade;

    /**
     * @var UserManipulator
     */
    protected $userManipulator;

    /**
     * @param Model\Project $project
     * @param Model\Video   $video
     *
     * @return Model\LabelingTask
     */
    protected function createTask(Model\Project $project, Model\Video $video)
    {
        $task = Model\LabelingTask::create(
            $video,
            $project,
            range(1, 100),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);

        return $this->labelingTaskFacade->save($task);
    }

    protected function createLabeledThing(Model\LabelingTask $task)
    {
        return $this->labeledThingFacade->save(
            Model\LabeledThing::create($task)
        );
    }

    protected function createLabeledThingInFrame(
        Model\LabeledThing $labeledThing,
        $frameIndex,
        $shapes = [],
        $classes = []
    ) {
        return $this->labeledThingInFrameFacade->save(
            Model\LabeledThingInFrame::create(
                $labeledThing,
                $frameIndex,
                $classes,
                $shapes
            )
        );
    }

    protected function createUser($username = self::USERNAME, $password = self::PASSWORD, $email = self::EMAIL)
    {
        $user = $this->userManipulator->create(
            $username,
            $password,
            $email,
            true,
            false
        );
        $user->addRole(Model\User::ROLE_ADMIN);

        return $user;
    }

    protected function createVideo($name)
    {
        return $this->videoFacade->save(
            Model\Video::create($name)
        );
    }

    protected function createProject($name)
    {
        return $this->projectFacade->save(
            Model\Project::create($name)
        );
    }

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');

        $this->userManipulator = $this->getService('fos_user.util.user_manipulator');
    }
}
