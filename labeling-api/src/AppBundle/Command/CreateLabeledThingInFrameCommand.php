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

            $video        = new Model\Video('foobar');
            $frameRange   = new Model\FrameRange($faker->numberBetween(1, 5), $faker->numberBetween(50, 100));
            $task         = new Model\LabelingTask($video, $frameRange);
            $labeledThing = new Model\LabeledThing($task);

            $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
            $labeledThingInFrame->setFrameNumber($faker->numberBetween());
            $labeledThingInFrame->setClasses($classes);
            $labeledThingInFrame->setShapes($shapes);

            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        }
    }
}
