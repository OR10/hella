<?php

namespace AnnoStationBundle\Command\CouchDb;

use Doctrine\ODM\CouchDB;
use Symfony\Component\Console;
use AnnoStationBundle\Command;

/**
 * Simple console command that can be used during deployment to warm up newly defined couchdb views.
 *
 * A view's index is automatically created with the very first request but this first index creation may take a very
 * long time. This command is intended to be executed during deployment *before* the deployed version gets activated
 * which saves us some trouble by doing this by hand.
 *
 * WARNING: However, we still can't just replace an existing view because it may be still in use during this warm up
 *          which has to be executed after updating the design documents.
 */
class WarmUpCouchDbViews extends Command\Base
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
        $this->setName('annostation:warmup-couchdb-views');
        $this->setDescription('Warm up couchdb views by querying each one of those with a limit of 1');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->writeSection($output, "warmup couchdb views");

        $configuration       = $this->documentManager->getConfiguration();
        $designDocumentNames = $configuration->getDesignDocumentNames();

        foreach ($designDocumentNames as $designDocumentName) {
            $designDocData  = $configuration->getDesignDocument($designDocumentName);
            $localDesignDoc = new $designDocData['className']($designDocData['options']);
            $localDocBody   = $localDesignDoc->getData();

            foreach (array_keys($localDocBody['views']) as $view) {
                $this->writeInfo($output, sprintf('%s/%s', $designDocumentName, $view));

                $this->documentManager->createQuery($designDocumentName, $view)->setLimit(1)->execute();
            }
        }
    }
}
