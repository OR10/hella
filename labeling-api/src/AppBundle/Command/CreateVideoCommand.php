<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateVideoCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * CreateVideoCommand constructor.
     *
     * @param Facade\Video $videoFacade
     */
    public function __construct(Facade\Video $videoFacade)
    {
        parent::__construct();
        $this->videoFacade = $videoFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:video')
            ->setDescription('Create random dummy video entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many videos do you want to create?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker       = Faker\Factory::create();
        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        for ($i = 0; $i < $count; $i++) {
            $video = new Model\Video($faker->word);
            $this->videoFacade->save($video);
        }
    }
}
