<?php

namespace Service\Storage;

class AbstractFactory
{
    const AZURE = 'azure';
    const S3CMD = 's3cmd';

    /**
     * @var array
     */
    public $app;

    public function __construct($app)
    {
        $this->app = $app;
    }
}