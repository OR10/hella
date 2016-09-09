<?php
namespace AppBundle\Voter\AccessCheck;

use AppBundle\Model;
use AppBundle\Voter;

class TaskIsAssignedToUserInAnyPhase extends Voter\AccessCheck
{
    /**
     * @param Model\User $user
     * @param object     $object
     *
     * @return bool
     */
    public function userHasAccessToObject(Model\User $user, $object): bool
    {
        if (!($object instanceof Model\LabelingTask)) {
            throw new \RuntimeException('Task AccessCheck got non Task as object.');
        }

        $phases = array(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        );

        $isAssignedToAnyPhase = array_reduce(
            $phases,
            function ($isAssigned, $phase) use ($user, $object) {
                /** @var Model\User $user */
                /** @var Model\LabelingTask $object */

                if ($isAssigned) {
                    return $isAssigned;
                } else {
                    return $user->getId() === $object->getLatestAssignedUserIdForPhase($phase);
                }
            },
            false
        );

        return $isAssignedToAnyPhase;
    }
}