<?php

namespace AppBundle\Command\Migrations;

use AppBundle\Command;
use AppBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;

class CopyAndDeleteProjectExportDocsToExportDocs extends Command\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\ProjectExport
     */
    private $projectExportFacade;

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;
    /**
     * @var Facade\VideoExport
     */
    private $videoExportFacade;

    /**
     * @param Facade\Project       $projectFacade
     * @param Facade\ProjectExport $projectExportFacade
     *
     * @param Facade\Exporter      $exporterFacade
     *
     * @param Facade\VideoExport   $videoExportFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\ProjectExport $projectExportFacade,
        Facade\Exporter $exporterFacade,
        Facade\VideoExport $videoExportFacade
    )
    {
        parent::__construct();
        $this->projectFacade       = $projectFacade;
        $this->projectExportFacade = $projectExportFacade;
        $this->exporterFacade = $exporterFacade;
        $this->videoExportFacade = $videoExportFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:copy-and-delete-project-exports-to-exports');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $projects = $this->projectFacade->findAll();
        foreach($projects as $project) {
            $projectExports = $this->projectExportFacade->findAllByProject($project);
            foreach($projectExports as $projectExport) {
                if ($projectExport->getVideoExportIds() === null) {
                    continue;
                }
                $zipContent = $this->getLegacyZipContent($projectExport);

                $date     = $projectExport->getDate();
                if ($date === null) {
                    preg_match('/csv_(\d+)_(\d+).zip/', $projectExport->getFilename(), $matchedDate);
                    $date = new \DateTime($matchedDate[1] . ' ' . $matchedDate[2], new \DateTimeZone('UTC'));
                }
                $filename = sprintf(
                    'export_%s.zip',
                    $date->format('Y-m-d-H-i-s')
                );

                $export = new Model\Export($project, $date);
                $export->addAttachment($filename, $zipContent, 'application/zip');
                $export->setStatus(Model\Export::EXPORT_STATUS_DONE);
                $this->exporterFacade->save($export);

                $this->projectExportFacade->delete($projectExport);
            }
        }
    }

    private function getLegacyZipContent(Model\ProjectExport $projectExport)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        $videoExportIds = $projectExport->getVideoExportIds();
        if (empty($videoExportIds)) {
            $zip->addEmptyDir('.');
        }
        foreach ($videoExportIds as $videoExportId) {
            $videoExport = $this->videoExportFacade->find($videoExportId);

            if (!$zip->addFromString($videoExport->getFilename(), $videoExport->getRawData())) {
                throw new \Exception('Unable to add content to zip archive');
            }
        }
        $zip->close();

        return file_get_contents($zipFilename);
    }

}