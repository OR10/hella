<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use AppBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;

class UserRolePermissionRebuilder extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilder;

    /**
     * UserRolePermissionRebuilder constructor.
     *
     * @param Facade\User                $userFacade
     * @param Service\UserRolesRebuilder $userRolesRebuilder
     */
    public function __construct(Facade\User $userFacade, Service\UserRolesRebuilder $userRolesRebuilder)
    {
        $this->userFacade         = $userFacade;
        $this->userRolesRebuilder = $userRolesRebuilder;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        try {
            $user = $this->userFacade->getUserById($job->getUserId());
            if($user instanceof Model\User) {
                $this->userRolesRebuilder->rebuildForUser($user);
            } else {
                throw new \Exception(sprintf('User not exist "%s"', $job->getUserId()));
            }
        } catch (\Exception $exception) {
            $loggerFacade->logString(
                $exception->getMessage(),
                \cscntLogPayload::SEVERITY_WARNING
            );
        }
        
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\UserRolePermissionRebuilder;
    }
}
