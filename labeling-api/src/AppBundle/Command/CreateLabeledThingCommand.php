<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLabeledThingCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * CreateLabeledThingCommand constructor.
     *
     * @param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Facade\LabeledThing $labeledThingFacade)
    {
        parent::__construct();
        $this->labeledThingFacade = $labeledThingFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:labeledthing')
            ->setDescription('Create random dummy labeled thing entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many labeled things do you want to create?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker = Faker\Factory::create();
        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        for ($i = 0; $i < $count; $i++) {
            $classes = array();
            for ($i = 0; $i < $faker->numberBetween(1, 5); $i++) {
                $classes[] = $faker->word;
            }

            $labeledThing = new Model\LabeledThing();
            $labeledThing->setClasses($classes);
            $labeledThing->setFrameRange(array($faker->numberBetween(0, 10), $faker->numberBetween(11, 20)));
            $labeledThing->setLabelingTaskId($faker->numberBetween(1, 5));

            $this->labeledThingFacade->save($labeledThing);
        }
    }
}