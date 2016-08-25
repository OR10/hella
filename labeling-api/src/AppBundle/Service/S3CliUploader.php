<?php
namespace AppBundle\Service;

use Symfony\Component\Process;

class S3CliUploader
{
    /**
     * Timeout of the upload process
     */
    const TIMEOUT = 0;

    /**
     * @var string
     */
    private $s3CliExecutable;

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
     * @param string $s3CliExecutable
     * @param string $cacheDirectory
     * @param string $bucket
     * @param string $accessKey
     * @param string $secretKey
     * @param string $hostBase
     * @param string $hostBucket
     */
    public function __construct(
        $s3CliExecutable,
        $cacheDirectory,
        $bucket,
        $accessKey,
        $secretKey,
        $hostBase,
        $hostBucket
    ) {
        $this->s3CliExecutable = $s3CliExecutable;
        $this->cacheDirectory  = $cacheDirectory;
        $this->bucket          = $bucket;
        $this->accessKey       = $accessKey;
        $this->secretKey       = $secretKey;
        $this->hostBase        = $hostBase;
        $this->hostBucket      = $hostBucket;
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
    }

    private function getUploadProcess($configFile, $sourceDirectory, $targetDirectoryOnS3)
    {
        $builder = new Process\ProcessBuilder();
        $builder
            ->setPrefix($this->s3CliExecutable)
            ->add('--config')
            ->add($configFile)
            ->add('sync')
            ->add('--delete-removed')
            ->add($sourceDirectory)
            ->add($this->getS3Uri($targetDirectoryOnS3));

        $process = $builder->getProcess();
        $process->setTimeout(self::TIMEOUT);

        return $process;
    }

    private function getS3Uri($targetDirectory = '')
    {
        if (strpos($targetDirectory, '/') === 1) {
            $targetDirectory = substr($targetDirectory, 1);
        }

        return sprintf(
            's3://%s/%s',
            $this->bucket,
            $targetDirectory
        );
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
        $tempFile = tempnam($this->cacheDirectory, 's3cli_upload_config');
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
