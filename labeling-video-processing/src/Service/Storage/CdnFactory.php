<?php

namespace Service\Storage;
use Service\FrameCdn;
use Service\VideoCdn;

class CdnFactory extends AbstractFactory
{
    /**
     * @return FrameCdnAzure|FrameCdn
     * @throws \RuntimeException
     */
    public function getCdnFrame()
    {
        switch ($this->app['storage_type']) {
            case self::AZURE:
                return new FrameCdnAzure(
                    $this->app['cacheDir'],
                    $this->app['FrameCmd']
                );
                break;
            case self::S3CMD:
                return new FrameCdn(
                    $this->app['base_url'],
                    $this->app['cacheDir'],
                    $this->app['FrameCmd']
                );
                break;
            default:
                throw new \RuntimeException('Wrong storage type');
        }
    }

    /**
     * @return VideoCdnAzure|VideoCdn
     * @throws \RuntimeException
     */
    public function getCdnVideo()
    {
        switch ($this->app['storage_type']) {
            case self::AZURE:
                return new VideoCdnAzure(
                    $this->app['cacheDir'],
                    $this->app['FrameCmd']
                );
                break;
            case self::S3CMD:
                return new VideoCdn(
                    $this->app['base_url'],
                    $this->app['cacheDir'],
                    $this->app['VideoCmd']
                );
                break;
            default:
                throw new \RuntimeException('Wrong storage type');
        }
    }
}