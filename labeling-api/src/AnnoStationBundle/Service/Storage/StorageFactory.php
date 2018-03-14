<?php

namespace AnnoStationBundle\Service\Storage;

use Service;
use Service\Cmd;
use Service\Azure;
use Symfony\Component\DependencyInjection\ContainerInterface;

class StorageFactory
{
    const AZURE = 'azure';
    const S3CMD = 's3cmd';

    private $videoCdnService;

    private $videoCdnServiceAzure;

    /**
     * @var ContainerInterface
     */
    private $container;

    public function __construct(
        $videoCdnService,
        $videoCdnServiceAzure,
        ContainerInterface $container
    ) {
        $this->videoCdnService = $videoCdnService;
        $this->videoCdnServiceAzure = $videoCdnServiceAzure;
        $this->container = $container;
    }

    /**
     * @return Cmd|Azure
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