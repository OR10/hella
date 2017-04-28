<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use crosscan\WorkerPool\AMQP;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use AnnoStationBundle\Worker\Jobs;

class RemoveExpiredUserAssignmentsAndMemberships extends Base
{
    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    public function __construct(
        AppBundleFacade\User $userFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Organisation $organisationFacade,
        Facade\Project $projectFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        parent::__construct();
        $this->amqpFacade          = $amqpFacade;
        $this->userFacade          = $userFacade;
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->organisationFacade  = $organisationFacade;
        $this->projectFacade       = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:remove-expired-user-assignments-and-memberships')
            ->setDescription('Remove LabelingTask Assignments and LabelGroup Memberships for all expired users');
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $expiredUsers = array_filter(
            $this->userFacade->getUserList(),
            function (Model\User $user) {
                return $user->isExpired();
            }
        );

        /** @var Model\User $user */
        foreach ($expiredUsers as $user) {
            $labelingGroups = $this->labelingGroupFacade->findAllByUser($user);

            /** @var Model\LabelingGroup $labelingGroup */
            foreach ($labelingGroups as $labelingGroup) {
                $this->labelingGroupFacade->deleteUserFromLabelGroup($labelingGroup, $user);
            }

            foreach ($user->getOrganisations() as $organisationId) {
                $organisation = $this->organisationFacade->find($organisationId);
                $this->removeLabelingTaskAssignments($organisation, $user);
            }
        }
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     */
    private function removeLabelingTaskAssignments(AnnoStationBundleModel\Organisation $organisation, Model\User $user)
    {
        $projects   = $this->projectFacade->findAllByOrganisation($organisation)->toArray();
        $projectIds = array_map(
            function (Model\Project $project) {
                return $project->getId();
            },
            $projects
        );

        $job = new Jobs\DeleteProjectAssignmentsForUserJobCreator($user->getId(), $projectIds);
        $this->amqpFacade->addJob($job);
    }
}