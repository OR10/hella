<?php

namespace AnnoStationBundle\Command;

use AppBundle\Database\Facade as AppBundleFacade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Style\SymfonyStyle;

class RemoveOrReplaceRoleAssignments extends Base
{
    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    public function __construct(AppBundleFacade\User $userFacade)
    {
        parent::__construct();
        $this->userFacade = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:remove-or-replace-roles-assignments')
            ->setDescription('Remove or optionally replace users role assignment')
            ->addArgument(
                'roleToRemove',
                Input\InputArgument::REQUIRED,
                'Role to remove'
            )->addArgument(
                'roleToReplaceWith',
                Input\InputArgument::OPTIONAL,
                'Replace optionally removed role with a new role'
            );
    }

    /**
     * @param Input\InputInterface   $input
     * @param Output\OutputInterface $output
     */
    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);

        $roleToRemove      = $input->getArgument('roleToRemove');
        $roleToReplaceWith = $input->getArgument('roleToReplaceWith');

        if (!$this->confirmChanges($io, $roleToRemove, $roleToReplaceWith)) {
            $io->error('Execution aborted');

            return;
        }

        $users = $this->userFacade->getUserList();

        foreach ($users as $user) {
            if ($user->hasRole($roleToRemove)) {
                $user->removeRole($roleToRemove);
                $io->note(sprintf('Removed role "%s" from user "%s"', $roleToRemove, $user->getUsername()));
                if ($roleToReplaceWith !== null) {
                    $user->addRole($roleToReplaceWith);
                    $io->note(sprintf('Added role "%s" to user "%s"', $roleToReplaceWith, $user->getUsername()));
                }
                $this->userFacade->saveUser($user);
            }
        }

        $io->success('Done');
    }

    /**
     *
     * @param SymfonyStyle $io
     * @param              $roleToRemove
     * @param              $roleToReplaceWith
     *
     * @return bool|mixed|null|string
     */
    private function confirmChanges(SymfonyStyle $io, $roleToRemove, $roleToReplaceWith)
    {
        return $io->confirm(
            sprintf(
                'Do you really want to delete the role Assignment %s? %s',
                $roleToRemove,
                ($roleToReplaceWith === null) ? '' : 'And replace it with role ' . $roleToReplaceWith
            )
        );
    }
}
