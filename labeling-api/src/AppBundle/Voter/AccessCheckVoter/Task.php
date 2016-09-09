<?php
namespace AppBundle\Voter\AccessCheckVoter;

use AppBundle\Database\Facade;
use AppBundle\Voter\AccessCheck;
use AppBundle\Voter\AccessCheckVoter;
use AppBundle\Model;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

/**
 * Access Permission Voter for LabelingTasks
 *
 * This Voter checks your access rights for tasks only, not for the belonging projects.
 * Therefore it should always be combined with a check regarding the corresponding project.
 * That is what AppBundle\Voter\AccessCheckVoter is for.
 */
class Task extends AccessCheckVoter
{
    const TASK_READ = 'task.read';
    const TASK_WRITE = 'task.write';
    const TASK_ASSIGN = 'task.assign';
    const TASK_UNASSIGN = 'task.unassign';

    /**
     * @var AccessCheck[]
     */
    private $checks;

    public function __construct()
    {
        /*
         * In order to allow Task access the following conditions need to apply:
         *
         * - Read always allowed
         * - Write only allowed if user is assigned to task.
         */
        $this->checks = array(
            self::TASK_READ  => [
                new AccessCheck\AlwaysGranted(),
            ],
            self::TASK_WRITE => [
                new AccessCheck\TaskIsAssignedToUserInAnyPhase(),
            ],
        );
    }

    /**
     * Provide a full list of all accepted attributes
     *
     * @return string[]
     */
    protected function getAttributes(): array
    {
        return array(
            self::TASK_READ,
            self::TASK_WRITE,
        );
    }

    /**
     * Provide the type of the accepted class (object)
     *
     * @return string
     */
    protected function getClass(): string
    {
        return Model\LabelingTask::class;
    }

    /**
     * Provide a list of AccessCheck implementation. The first one to return true will stop the evaluation chain.
     *
     * @param string $attribute
     *
     * @return \AppBundle\Voter\AccessCheck[]|array
     */
    protected function getChecks(string $attribute): array
    {
        return $this->checks[$attribute];
    }
}
