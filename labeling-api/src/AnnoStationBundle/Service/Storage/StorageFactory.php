<?php

namespace AnnoStationBundle\Service\Storage;

use AnnoStationBundle\Service\VideoCdn\S3Cmd;
use AnnoStationBundle\Service\VideoCdn\Azure;
use Symfony\Component\DependencyInjection\ContainerInterface;

class StorageFactory
{
    const AZURE = 'azure';
    const S3CMD = 's3cmd';

    /**
     * @var S3Cmd
     */
    private $videoCdnService;

    /**
     * @var Azure
     */
    private $videoCdnServiceAzure;

    /**
     * @var ContainerInterface
     */
    private $container;

    public function __construct(
        S3Cmd $videoCdnService,
        Azure $videoCdnServiceAzure,
        ContainerInterface $container
    ) {
        $this->videoCdnService = $videoCdnService;
        $this->videoCdnServiceAzure = $videoCdnServiceAzure;
        $this->container = $container;
    }

    /**
     * @return S3Cmd|Azure
     * @throws \RuntimeException
     */
    public function getStorage()
    {
        switch ($this->container->getParameter('storage_type')) {
            case self::AZURE:
                return $this->videoCdnServiceAzure;
                break;
            case self::S3CMD:
                return $this->videoCdnService;
                break;
            default:
                throw new \RuntimeException('Wrong storage type');
        }
    }
}