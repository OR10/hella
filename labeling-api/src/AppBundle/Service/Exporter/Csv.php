<?php
namespace AppBundle\Service\Exporter;

use AppBundle\Model;
use AppBundle\Database\Facade;

class Csv
{
    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * Csv constructor.
     * @param Facade\Exporter $exporterFacade
     */
    public function __construct(Facade\Exporter $exporterFacade)
    {
        $this->exporterFacade = $exporterFacade;
    }

    /**
     * @param Model\Project $project
     */
    public function export(Model\Project $project)
    {
        // Column definitions
        // Sort Columns
        // Build Rows with data
        // Sort Rows (by frame number)
        // To Csv File
        // CompressFiles & Save To DB


        $zipContent = $this->compressFiles([]);

        $date = new \DateTime('now', new \DateTimeZone('UTC'));
        $filename = sprintf(
            'export_%s.zip',
            $date->format('Y-m-d-H-i-s')
        );

        $export = new Model\Export($project, $filename, $zipContent, 'application/zip');
        $this->exporterFacade->save($export);

    }

    /**
     * @param array $files
     * @return string
     * @throws \Exception
     */
    private function compressFiles(array $files)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        if (empty($files)) {
            $zip->addEmptyDir('.');
        }
        foreach ($files as $file) {
            $zip->addFile($file);
        }

        $zip->close();

        return file_get_contents($zipFilename);
    }
}