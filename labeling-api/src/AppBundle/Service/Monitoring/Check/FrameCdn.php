<?php

namespace AppBundle\Service\Monitoring\Check;

use ZendDiagnostics\Check;
use ZendDiagnostics\Result;
use ZendDiagnostics\Result\ResultInterface;
use League\Flysystem;

/**
 * Check implementation of the Frame CDN Service
 */
class FrameCdn implements Check\CheckInterface
{
    /**
     * @var Flysystem\Filesystem
     */
    private $fileSystem;

    public function __construct(Flysystem\Filesystem $fileSystem)
    {
        $this->fileSystem = $fileSystem;
    }

    /**
     * Perform the actual check and return a ResultInterface
     *
     * @return ResultInterface
     */
    public function check()
    {
        $dateTime     = new \DateTime('now', new \DateTimeZone('UTC'));
        $testFilePath = 'monitoring/frame_cdn_write_test.txt';

        try {
            $this->fileSystem->put($testFilePath, $dateTime->getTimestamp());
        } catch (\Exception $e) {
            return new Result\Failure('Failed to write to the frame cdn service!');
        }

        try {
            $frameCdnContent = $this->fileSystem->read($testFilePath);
        } catch (\Exception $e) {
            return new Result\Failure('Failed to read from the frame cdn service!');
        }

        try {
            $this->fileSystem->delete($testFilePath);
        } catch (\Exception $e) {
            return new Result\Failure('Failed to delete file from the frame cdn service!');
        }

        if ((int) $frameCdnContent !== $dateTime->getTimestamp()) {
            return new Result\Failure('Written test file content is not as expected!');
        }

        return new Result\Success();
    }

    /**
     * Return a label describing this test instance.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Frame CDN Service (write, read, delete)';
    }
}