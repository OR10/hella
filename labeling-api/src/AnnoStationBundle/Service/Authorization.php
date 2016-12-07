<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AnnoStationBundle\Voter\AccessCheckVoter;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Service do permission checking in controllers based on the symfony voting system
 */
class Authorization
{
    /**
     * @var AuthorizationCheckerInterface
     */
    private $authorizationChecker;

    /**
     * Authorization constructor.
     *
     * @param AuthorizationCheckerInterface $authorizationChecker
     */
    public function __construct(
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * @param Model\Project $project
     */
    public function denyIfProjectIsNotReadable(Model\Project $project)
    {
        if (!$this->authorizationChecker->isGranted([AccessCheckVoter\Project::PROJECT_READ], $project)) {
            throw new AccessDeniedHttpException('Access to project denied.');
        }
    }

    /**
     * @param Model\Project $project
     */
    public function denyIfProjectIsNotWritable(Model\Project $project)
    {
        if (!$this->authorizationChecker->isGranted([AccessCheckVoter\Project::PROJECT_WRITE], $project)) {
            throw new AccessDeniedHttpException('Access to project denied.');
        }
    }

    /**
     * @param Model\LabelingTask $task
     */
    public function denyIfTaskIsNotReadable(Model\LabelingTask $task)
    {
        if (!$this->authorizationChecker->isGranted([AccessCheckVoter\Task::TASK_READ], $task)) {
            throw new AccessDeniedHttpException('Access to task denied.');
        }
    }

    /**
     * @param Model\LabelingTask $task
     */
    public function denyIfTaskIsNotWritable(Model\LabelingTask $task)
    {
        if (!$this->authorizationChecker->isGranted([AccessCheckVoter\Task::TASK_WRITE], $task)) {
            throw new AccessDeniedHttpException('Access to task denied.');
        }
    }
}
