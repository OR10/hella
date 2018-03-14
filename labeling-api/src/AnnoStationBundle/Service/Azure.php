<?php
namespace AnnoStationBundle\Service;

use MicrosoftAzure\Storage\Blob\BlobRestProxy;

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

    private $frameCdnBaseUrlAzure;

    public function __construct($endpointsProtocol, $accountName, $accountKey, $blobEndpoint, $container, $dir, $frameCdnBaseUrlAzure)
    {
        $this->endpointsProtocol = $endpointsProtocol;
        $this->accountName = $accountName;
        $this->accountKey = $accountKey;
        $this->blobEndpoint = $blobEndpoint;
        $this->container = $container;
        $this->dir = $dir;
        $this->frameCdnBaseUrlAzure = $frameCdnBaseUrlAzure;
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

    public function uploadDirectory($sourceDirectory, $targetDirectory, $acl)
    {
        // TODO: Implement uploadDirectory() method.
    }

    public function uploadFile($video, $source)
    {
        $this->blobClientCreate()->createBlockBlob($this->dir.'/'.$video->getId(), 'source', $source);
        return 'ok';
    }

    public function getFile($filePath)
    {
        $blob = $this->blobClientCreate()->getBlob($this->container, $filePath);
        return $blob;
    }

    public function getBaseUrl()
    {
        return $this->frameCdnBaseUrlAzure;
    }

}