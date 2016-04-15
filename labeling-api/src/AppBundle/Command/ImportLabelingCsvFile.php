<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportLabelingCsvFile extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\LabelImporter
     */
    private $labelImporter;

    /**
     * ImportLabelingCsvFile constructor.
     * @param Facade\Project $projectFacade
     * @param Service\LabelImporter $labelImporter
     */
    public function __construct(
        Facade\Project $projectFacade,
        Service\LabelImporter $labelImporter
    ) {
        parent::__construct();
        $this->projectFacade = $projectFacade;
        $this->labelImporter = $labelImporter;
    }

    protected function configure()
    {
        $this->setName('annostation:import:csv')
            ->setDescription('Import a csv labeling file')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the csv file.')
            ->addOption('projectName', null, Input\InputOption::VALUE_REQUIRED, 'Project Name')
            ->addOption('delimiter', null, Input\InputOption::VALUE_OPTIONAL, 'delimiter charset', ',')
            ->addOption('enclosure', null, Input\InputOption::VALUE_OPTIONAL, 'enclosure charset', '"');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $project = $this->projectFacade->findByName($input->getOption('projectName'));

        $content = file_get_contents($input->getArgument('file'));

        $data = array();

        foreach (
            preg_split(
                "(\r\n|\r|\n)",
                $content,
                -1,
                PREG_SPLIT_NO_EMPTY
            ) as $line
        ) {
            if (empty($line)) {
                continue;
            }
            $data[] = str_getcsv(
                $line,
                $input->getOption('delimiter'),
                $input->getOption('enclosure')
            );
        }

        $data = $this->convertArrayToHashmap($data);

        $this->labelImporter->importLabels($project, $data);
    }

    private function convertArrayToHashmap(array $rows)
    {
        $header = array_shift($rows);
        return array_map(
            function (array $row) use ($header) {
                return array_combine(
                    $header,
                    $row
                );
            },
            $rows
        );
    }
}