<?php

namespace AnnoStationBundle\Command\CouchDb;

use Doctrine\ODM\CouchDB;
use Symfony\Component\Console;
use Symfony\Component\Console\Input;
use AnnoStationBundle\Command;

class CouchDbViewMaintainer extends Command\Base
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        parent::__construct();

        $this->documentManager = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:couch-db-view-maintainer');
        $this->setDescription('Cleanup the CouchDB. Compact the database/all views and cleanup deleted views.');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $input = new Input\ArrayInput([]);
        $this->getApplication()->find('doctrine:couchdb:maintenance:compact-database')
            ->run($input, $output);
        $this->getApplication()->find('doctrine:couchdb:maintenance:view-cleanup')
            ->run($input, $output);
        $this->writeSection($output, "compact-database done.");

        $configuration       = $this->documentManager->getConfiguration();
        $designDocumentNames = $configuration->getDesignDocumentNames();

        foreach ($designDocumentNames as $designDocumentName) {
            $designDocData  = $configuration->getDesignDocument($designDocumentName);
            $localDesignDoc = new $designDocData['className']($designDocData['options']);
            $localDocBody   = $localDesignDoc->getData();

            if (array_key_exists('views', $localDocBody)) {
                foreach (array_keys($localDocBody['views']) as $view) {
                    $this->writeInfo($output, sprintf('%s/%s', $designDocumentName, $view));

                    $input = new Input\ArrayInput(
                        [
                            'designdoc' => $designDocumentName,
                        ]
                    );

                    $this->getApplication()->find('doctrine:couchdb:maintenance:compact-view')
                        ->run($input, $output);
                }
            }
        }
    }
}
