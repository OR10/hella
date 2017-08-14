<?php

namespace crosscan\WorkerPool\Job;

/**
 * @property-read string $filename
 */
class TestJob extends \crosscan\WorkerPool\Job
{
    public $message = 'Hallo Welt';
    private $filename;

    public function __construct()
    {
        $this->filename = tempnam('', '');
        chmod($this->filename, 0666);
    }

    public function __get($name)
    {
        if ($name === 'filename') {
            return $this->filename;
        }
    }
}
