<?php
namespace Service;

use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;
use Symfony\Component\Process;

class Azure
{
    /**
     * Timeout of the upload process
     */
    const TIMEOUT = 0;

    /**
     * @var string
     */
    private $azureCmdExecutable;

    /**
     * @var string
     */
    private $parallelExecutable;

    /**
     * @var int
     */
    private $numberOfParallelConnections;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @var string
     */
    private $endpointsProtocol;

    /**
     * @var string
     */
    private $accountName;

    /**
     * @var string
     */
    private $accountKey;

    /**
     * @var string
     */
    private $container;

    /**
     * @var string
     */
    private $blobEndpoint;

    /**
     * @var string
     */
    private $dir;

    public function __construct(
        $azureCmdExecutable,
        $parallelExecutable,
        $numberOfParallelConnections,
        $cacheDirectory,
        $endpointsProtocol,
        $accountName,
        $accountKey,
        $blobEndpoint,
        $container,
        $dir)
    {
        $this->azureCmdExecutable             = $azureCmdExecutable;
        $this->parallelExecutable          = $parallelExecutable;
        $this->numberOfParallelConnections = $numberOfParallelConnections;
        $this->cacheDirectory              = $cacheDirectory;
        $this->endpointsProtocol = $endpointsProtocol;
        $this->accountName = $accountName;
        $this->accountKey = $accountKey;
        $this->blobEndpoint = $blobEndpoint;
        $this->container = $container;
        $this->dir = $dir;
    }

    /**
     * @return BlobRestProxy
     */
    public function blobClientCreate()
    {
        $connectionString = "DefaultEndpointsProtocol=" . $this->endpointsProtocol . ";
                             AccountName=" . $this->accountName . ";
                             AccountKey=" . $this->accountKey . ";
                             BlobEndpoint=" . $this->blobEndpoint;

        return BlobRestProxy::createBlobService($connectionString);
    }

    /**
     * @return string
     */
    public function createConnectionString()
    {
        return "DefaultEndpointsProtocol=" . $this->endpointsProtocol . ";AccountName=" . $this->accountName . ";AccountKey=" . $this->accountKey . ";BlobEndpoint=" . $this->blobEndpoint;
    }

    public function uploadDirectory($sourceDirectory)
    {
        $connectionString = $this->createConnectionString();

        $process = $this->getUploadProcess($connectionString, $sourceDirectory);

        $process->mustRun();

        if ($process->getExitCode() !== 0) {
            throw new \RuntimeException(
                'Execution of extern azurecmd upload command unsuccessful: ' . $process->getErrorOutput()
            );
        }
    }

    public function uploadFile($video, $source)
    {
        $this->blobClientCreate()->createBlockBlob($this->dir, $video, $source);
        return 'ok';
    }

    public function getFile($filePath)
    {
        try {
            $blob = $this->blobClientCreate()->getBlob($this->dir, $filePath);
        }
        catch (ServiceException $e) {
            $code = $e->getCode();
            $error_message = $e->getMessage();

        }

        return $blob->getContentStream();
    }

    /**
     * @param $connectionString
     * @param $sourceDirectory
     * @return Process\Process
     * TODO: to add parallel upload
     */
    private function getUploadProcess($connectionString, $sourceDirectory)
    {
        $builder = new Process\ProcessBuilder();
        $builder
            ->add($this->azureCmdExecutable)
            ->add('storage')
            ->add('blob')
            ->add('upload-batch')
            ->add('--connection-string')
            ->add($connectionString)
            ->add('--source')
            ->add($sourceDirectory)
            ->add('--destination')
            ->add($this->dir);

        $process = $builder->getProcess();

        $process->setTimeout(self::TIMEOUT);

        return $process;
    }

    /**
     * @param string $sourceDirectory
     * @return string
     */
    private function getRelativeUploadFileList($sourceDirectory)
    {
        $iterator = new \CallbackFilterIterator(
            new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDirectory)
            ),
            function ($current) {
                /** @var \SplFileInfo $current */
                return $current->isFile();
            }
        );

        $sourceDirectoryLength = strlen($sourceDirectory);
        $fileList              = array();
        foreach ($iterator as $file) {
            $pathname   = $file->getPathname();
            $fileList[] = substr($pathname, $sourceDirectoryLength + 1);
        }
        return implode("\n", $fileList);
    }

}