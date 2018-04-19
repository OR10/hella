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

    /**
     * @var string
     */
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

    /**
     * @param $video
     * @param $source
     * @return string
     */
    public function uploadFile($video, $source, string $projectId = null)
    {
        if($projectId) {
            $this->blobClientCreate()->createBlockBlob($this->dir.'/'.$projectId, 'source', $source);
        } else {
            $this->blobClientCreate()->createBlockBlob($this->dir.'/'.$video->getId(), 'source', $source);
        }
    }

    /**
     * @param $filePath
     * @return \MicrosoftAzure\Storage\Blob\Models\GetBlobResult
     */
    public function getFile($filePath)
    {
        $blob = $this->blobClientCreate()->getBlob($this->container, $filePath);
        return $blob;
    }

    /**
     * @return string
     */
    public function getBaseUrl()
    {
        return $this->frameCdnBaseUrlAzure;
    }

}