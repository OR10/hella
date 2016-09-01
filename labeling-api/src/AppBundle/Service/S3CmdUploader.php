<?php
namespace AppBundle\Service;

use Symfony\Component\Finder\Iterator\RecursiveDirectoryIterator;
use Symfony\Component\Process;

class S3CmdUploader
{
    /**
     * Timeout of the upload process
     */
    const TIMEOUT = 0;

    /**
     * @var string
     */
    private $s3CmdExecutable;

    /**
     * @var string
     */
    private $parallelExecutable;

    /**
     * @var int
     */
    private $numberOfParallelConnections;

    /**
     * @var string
     */
    private $cacheDirectory;

    /**
     * @var string
     */
    private $bucket;

    /**
     * @var string
     */
    private $accessKey;

    /**
     * @var string
     */
    private $secretKey;

    /**
     * @var string
     */
    private $hostBase;

    /**
     * @var string
     */
    private $hostBucket;

    /**
     * S3Uploader constructor.
     *
     * @param string $s3CmdExecutable
     * @param string $parallelExecutable
     * @param int    $numberOfParallelConnections
     * @param string $cacheDirectory
     * @param string $bucket
     * @param string $accessKey
     * @param string $secretKey
     * @param string $hostBase
     * @param string $hostBucket
     */
    public function __construct(
        $s3CmdExecutable,
        $parallelExecutable,
        $numberOfParallelConnections,
        $cacheDirectory,
        $bucket,
        $accessKey,
        $secretKey,
        $hostBase,
        $hostBucket
    ) {
        $this->s3CmdExecutable             = $s3CmdExecutable;
        $this->parallelExecutable          = $parallelExecutable;
        $this->numberOfParallelConnections = $numberOfParallelConnections;
        $this->cacheDirectory              = $cacheDirectory;
        $this->bucket                      = $bucket;
        $this->accessKey                   = $accessKey;
        $this->secretKey                   = $secretKey;
        $this->hostBase                    = $hostBase;
        $this->hostBucket                  = $hostBucket;
    }

    public function uploadDirectory($sourceDirectory, $targetDirectoryOnS3)
    {
        $configFile = $this->generateConfigfile(
            $this->accessKey,
            $this->secretKey,
            $this->hostBase,
            $this->hostBucket
        );

        $process = $this->getUploadProcess($configFile, $sourceDirectory, $targetDirectoryOnS3);

        try {
            $process->mustRun();
        } finally {
            unlink($configFile);
        }

        if ($process->getExitCode() !== 0) {
            throw new \RuntimeException('Execution of extern s3cmd upload command unsuccessful: ' . $process->getErrorOutput());
        }
    }

    private function getUploadProcess($configFile, $sourceDirectory, $targetDirectoryOnS3)
    {
        $builder = new Process\ProcessBuilder();
        $builder
            ->setPrefix($this->parallelExecutable)
            ->add('-j' . $this->numberOfParallelConnections)
            ->add($this->s3CmdExecutable)
            ->add('--config')
            ->add($configFile)
            ->add('--acl-public')
            ->add('put')
            ->add('{}')
            ->add($this->getS3Uri($targetDirectoryOnS3 . '/{}'));

        $process = $builder->getProcess();

        $process->setWorkingDirectory($sourceDirectory);
        $process->setInput($this->getRelativeUploadFileList($sourceDirectory));
        $process->setTimeout(self::TIMEOUT);

        return $process;
    }

    private function getS3Uri($targetDirectory = '')
    {
        $sanitizedTargetDirectory = preg_replace('(/+)', '/', $targetDirectory);

        if (strpos($sanitizedTargetDirectory, '/') === 0) {
            $sanitizedTargetDirectory = substr($sanitizedTargetDirectory, 1);
        }


        return sprintf(
            's3://%s/%s',
            $this->bucket,
            $sanitizedTargetDirectory
        );
    }

    private function getRelativeUploadFileList($sourceDirectory)
    {
        $iterator = new \CallbackFilterIterator(
            new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDirectory)
            ),
            function ($current) {
                /** @var \SplFileInfo $current */
                return $current->isFile();
            }
        );

        $sourceDirectoryLength = strlen($sourceDirectory);
        $fileList              = array();
        foreach ($iterator as $file) {
            $pathname   = $file->getPathname();
            $fileList[] = substr($pathname, $sourceDirectoryLength + 1);
        }

        return implode("\n", $fileList);
    }

    /**
     * @param string $accessKey
     * @param string $secretKey
     * @param string $hostBase
     * @param string $hostBucket
     * @param bool   $useHttps
     * @param bool   $checkSslCertificate
     * @param bool   $checkSslHostname
     *
     * @return string
     */
    private function generateConfigfile(
        $accessKey,
        $secretKey,
        $hostBase = 's3.amazonaws.com',
        $hostBucket = '%(bucket)s.s3.amazonaws.com',
        $useHttps = true,
        $checkSslCertificate = true,
        $checkSslHostname = false
    ) {
        $tempFile = tempnam($this->cacheDirectory, 's3cmd_upload_config_');
        file_put_contents(
            $tempFile,
            sprintf(
                $this->getConfigfileTemplate(),
                $accessKey,
                $secretKey,
                $hostBase,
                $hostBucket,
                $this->convertBooleanToConfigString($useHttps),
                $this->convertBooleanToConfigString($checkSslCertificate),
                $this->convertBooleanToConfigString($checkSslHostname)
            )
        );

        return $tempFile;
    }

    private function getConfigfileTemplate()
    {
        return <<<EOF
[default]
access_key = %s
secret_key = %s
host_base = %s
host_bucket = %s
use_https = %s
check_ssl_certificate = %s
check_ssl_hostname = %s
EOF;
    }

    private function convertBooleanToConfigString($boolean)
    {
        return $boolean === true ? 'True' : 'False';
    }
}