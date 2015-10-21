<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLabeledThingInFrameCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * CreateLabeledThingInFrameCommand constructor.
     *
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        parent::__construct();
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:labeledthinginframe')
            ->setDescription('Create random dummy labeled thing in frame entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many labeled things in frame do you want to create?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker = Faker\Factory::create();
        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        for ($i = 0; $i < $count; $i++) {
            $classes = [];
            $shapes  = [];
            for ($i = 0; $i < $faker->numberBetween(1, 5); $i++) {
                $classes[] = $faker->word;
                $shapes[]  = $faker->word;
            }

            $labeledThingInFrame = new Model\LabeledThingInFrame();
            $labeledThingInFrame->setFrameNumber($faker->numberBetween());
            $labeledThingInFrame->setClasses($classes);
            $labeledThingInFrame->setShapes($shapes);
            $labeledThingInFrame->setLabeledThingId($faker->numberBetween(1, 5));

            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        }
    }
}
