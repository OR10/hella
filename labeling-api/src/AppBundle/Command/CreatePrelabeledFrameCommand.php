<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreatePrelabeledFrameCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\PrelabeledFrame
     */
    private $prelabeledFrameFacade;

    /**
     * CreatePrelabeledFrameCommand constructor.
     *
     * @param Facade\PrelabeledFrame $prelabeledFrameFacade
     */
    public function __construct(Facade\PrelabeledFrame $prelabeledFrameFacade)
    {
        parent::__construct();
        $this->prelabeledFrameFacade = $prelabeledFrameFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:prelabeledframe')
            ->setDescription('Create random dummy prelabeled frame entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many prelabeled frames do you want to create?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker = Faker\Factory::create();
        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        for ($i = 0; $i < $count; $i++) {
            $classes = [];
            for ($i = 0; $i < $faker->numberBetween(1, 5); $i++) {
                $classes[] = $faker->word;
            }

            $prelabeledFrame = new Model\PrelabeledFrame();
            $prelabeledFrame->setFrameNo($faker->numberBetween());
            $prelabeledFrame->setClasses($classes);
            $prelabeledFrame->setVideoId($faker->numberBetween(1, 5));

            $this->prelabeledFrameFacade->save($prelabeledFrame);
        }
    }
}
