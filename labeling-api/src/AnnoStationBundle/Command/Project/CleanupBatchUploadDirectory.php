<?php

namespace AnnoStationBundle\Command\Project;

use AnnoStationBundle\Command\Base;
use SplFileInfo;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class CleanupBatchUploadDirectory extends Base
{
    /**
     * Number of seconds to keep temporary files.
     *
     * @var int
     */
    const KEEP_FILES_IN_SECONDS = 86400;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @param string $cacheDirectory
     */
    public function __construct(string $cacheDirectory)
    {
        $this->cacheDirectory = $cacheDirectory;

        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('annostation:project:cleanup_batch_upload_directory')
            ->setDescription('Cleanup project batch upload directory');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $this->writeSection($output, sprintf('Cleaning directory: %s', $this->cacheDirectory));

        /** @var SplFileInfo[] $files */
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($this->cacheDirectory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $fileinfo) {
            if (time() - $fileinfo->getMTime() < self::KEEP_FILES_IN_SECONDS) {
                $this->writeVerboseInfo($output, sprintf('keeping directory: %s', $fileinfo->getRealPath()));
                continue;
            }

            if ($fileinfo->isDir()) {
                $this->writeVerboseInfo($output, sprintf('removing directory: %s', $fileinfo->getRealPath()));
                rmdir($fileinfo->getRealPath());
            } else {
                $this->writeVerboseInfo($output, sprintf('removing file: %s', $fileinfo->getRealPath()));
                unlink($fileinfo->getRealPath());
            }
        }
    }
}
