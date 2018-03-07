<?php

namespace Service\Storage;

use FOS\UserBundle\Form\Factory\FactoryInterface;
use Service\Azure;
use Service\Cmd;

class StorageFactory extends AbstractFactory
{
    /**
     * @return Cmd|Azure
     * @throws \RuntimeException
     */
    public function getStorageFrame()
    {
        switch ($this->app['storage_type']) {
            case self::AZURE:
                return new Azure(
                    $this->app['azureDefaultEndpointsProtocol'],
                    $this->app['azureAccountName'],
                    $this->app['azureAccountKey'],
                    $this->app['azureBlobEndpoint'],
                    $this->app['azureContainer'],
                    $this->app['azureDirFrame']
                );
                break;
            case self::S3CMD:
                return new Cmd(
                    $this->app['s3CmdExecutable'],
                    $this->app['parallelExecutable'],
                    $this->app['numberOfParallelConnections'],
                    $this->app['cacheDirectory'],
                    $this->app['bucket'],
                    $this->app['accessKey'],
                    $this->app['secretKey'],
                    $this->app['hostBase'],
                    $this->app['hostBucket']
                );
                break;
            default:
                throw new \RuntimeException('Wrong storage type');
        }
    }

    /**
     * @return Cmd|Azure
     * @throws \RuntimeException
     */
    public function getStorageVideo()
    {
        switch ($this->app['storage_type']) {
            case self::AZURE:
                return new Azure(
                    $this->app['azureDefaultEndpointsProtocol'],
                    $this->app['azureAccountName'],
                    $this->app['azureAccountKey'],
                    $this->app['azureBlobEndpoint'],
                    $this->app['azureContainer'],
                    $this->app['azureDirVideo']
                );
                break;
            case self::S3CMD:
                return new Cmd(
                    $this->app['s3CmdExecutable'],
                    $this->app['parallelExecutable'],
                    $this->app['numberOfParallelConnections'],
                    $this->app['cacheDirectory'],
                    $this->app['videoBucket'],
                    $this->app['accessKey'],
                    $this->app['secretKey'],
                    $this->app['hostBase'],
                    $this->app['hostBucket']
                );
                break;
            default:
                throw new \RuntimeException('Wrong storage type');
        }
    }
}