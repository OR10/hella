<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Service\LabelImporter;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportLabelData extends Base
{
    /**
     * @var LabelImporter\SimpleXml
     */
    private $simpleXmlService;

    /**
     * ImportLabelData constructor.
     *
     * @param LabelImporter\SimpleXml $simpleXmlService
     */
    public function __construct(
        LabelImporter\SimpleXml $simpleXmlService
    ) {
        parent::__construct();
        $this->simpleXmlService = $simpleXmlService;
    }

    protected function configure()
    {
        $this->setName('annostation:import:labelData')
            ->setDescription('Import a csv labeling file for an already imported video')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the file.')
            ->addOption('taskId', null, Input\InputOption::VALUE_REQUIRED, 'task ID')
            ->addOption('delimiter', null, Input\InputOption::VALUE_OPTIONAL, 'delimiter charset', ',')
            ->addOption('enclosure', null, Input\InputOption::VALUE_OPTIONAL, 'enclosure charset', '"');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $this->simpleXmlService->import(
            $input->getOption('taskId'),
            $input->getArgument('file'),
            $input->getOption('delimiter'),
            $input->getOption('enclosure')
        );
    }
}
