<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLabeledFrameCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * CreateLabeledFrameCommand constructor.
     *
     * @param Facade\LabeledFrame $labeledFrameFacade
     */
    public function __construct(Facade\LabeledFrame $labeledFrameFacade)
    {
        parent::__construct();
        $this->labeledFrameFacade = $labeledFrameFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:labeledframe')
            ->setDescription('Create random dummy labeled frame entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many labeled frames do you want to create?");
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

            $labeledFrame = new Model\LabeledFrame();
            $labeledFrame->setClasses($classes);
            $labeledFrame->setFrameNo($faker->numberBetween());
            $labeledFrame->setLabelingTaskId($faker->numberBetween(0, 5));

            $this->labeledFrameFacade->save($labeledFrame);
        }
    }
}
