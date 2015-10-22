<?php

namespace AppBundle\Command;

use AppBundle\Model;
use Faker;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLabelingTaskCommand extends ContainerAwareCommand
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * CreateLabelingTaskCommand constructor.
     *
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:create:labelingtask')
            ->setDescription('Create random dummy labeling task entry in the database')
            ->addArgument('count', InputArgument::OPTIONAL, "How many labeling tasks do you want to create?");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $faker = Faker\Factory::create();
        $count = $input->getArgument('count') ? $input->getArgument('count') : 1;

        for ($i = 0; $i < $count; $i++) {
            $video = new Model\Video($faker->word);
            $labelingTask = new Model\LabelingTask(
                $video,
                new Model\FrameRange($faker->numberBetween(1, 10), $faker->numberBetween(11, 20))
            );
            $labelingTask->setUserId($faker->numberBetween(1, 5));
            $labelingTask->setVideoId($faker->numberBetween(1, 5));

            $this->labelingTaskFacade->save($labelingTask);
        }
    }
}
