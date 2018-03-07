<?php
namespace Service;

use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;

class Azure
{
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

    public function __construct($endpointsProtocol, $accountName, $accountKey, $blobEndpoint, $container, $dir)
    {
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
//        $connectionString = "DefaultEndpointsProtocol=" . $this->endpointsProtocol . ";
//                             AccountName=" . $this->accountName . ";
//                             AccountKey=" . $this->accountKey . ";
//                             BlobEndpoint=" . $this->blobEndpoint . '/' . $this->container;

        $connectionString = "DefaultEndpointsProtocol=" . $this->endpointsProtocol . ";
                             AccountName=" . $this->accountName . ";
                             AccountKey=" . $this->accountKey . ";
                             BlobEndpoint=" . $this->blobEndpoint;

        return BlobRestProxy::createBlobService($connectionString);
    }

    public function uploadDirectory($sourceDirectory, $targetDirectory)
    {

    }

    public function uploadFile($video, $source)
    {
        $this->blobClientCreate()->createBlockBlob($this->dir, $video, $source);
        return 'ok';
    }

    public function getFile($filePath)
    {
        try {
            $blob = $this->blobClientCreate()->getBlob($this->container, $this->dir.'/'.$filePath);
        }
        catch (ServiceException $e) {
            $code = $e->getCode();
            $error_message = $e->getMessage();

        }
            return $blob->getContentStream();
    }

}