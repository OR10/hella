<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class CalculateImageDiskUsage extends Command\Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var
     */
    private $frameCdnBaseUrl;

    /**
     * @var
     */
    private $kernelEnvironment;

    /**
     * @param Facade\Video $videoFacade
     * @param              $frameCdnBaseUrl
     * @param              $kernelEnvironment
     */
    public function __construct(
        Facade\Video $videoFacade,
        $frameCdnBaseUrl,
        $kernelEnvironment
    ) {
        parent::__construct();
        $this->videoFacade       = $videoFacade;
        $this->frameCdnBaseUrl   = $frameCdnBaseUrl;
        $this->kernelEnvironment = $kernelEnvironment;
    }

    protected function configure()
    {
        $this->setName('annostation:calculateImageDiskUsage');
        $this->addOption('dry-run', null, Console\Input\InputOption::VALUE_NONE, "Don't actually change anything.");
        $this->addOption(
            'force',
            null,
            Console\Input\InputOption::VALUE_NONE,
            "Recalculate all videos instead of missing calculations only"
        );
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $dryRun = $input->getOption('dry-run');
        $force  = $input->getOption('force');

        if ($dryRun) {
            $this->writeInfo($output, 'dry run');
        }

        $videos = $this->videoFacade->findAll();

        $curlHandle = $this->initCurl();

        $numberOfImagesToGet = 0;
        /** @var Model\Video $video */
        foreach ($videos as $video) {
            $numberOfImagesToGet += $video->getMetaData()->numberOfFrames * count($video->getImageTypes());
        }
        $progress = new ProgressBar($output, $numberOfImagesToGet);
        $progress->setFormat("%current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% (%size%)");

        /** @var Model\Video $video */
        $calculatedBytesInThisRun = 0;
        foreach ($videos as $video) {
            $frameRange = range(1, $video->getMetaData()->numberOfFrames);

            if ($video->getImageTypes() === null) {
                continue;
            }

            foreach ($video->getImageTypes() as $type => $data) {
                if (isset($data['sizeInBytes']) && !empty($data['sizeInBytes']) && !$force) {
                    foreach ($data['sizeInBytes'] as $bytes) {
                        $calculatedBytesInThisRun += $bytes;
                    }
                    $progress->setMessage($this->formatBytes($calculatedBytesInThisRun), 'size');
                    $progress->advance(count($frameRange));
                    continue;
                }
                switch ($type) {
                    case 'source':
                        $extension = 'png';
                        break;
                    default:
                        $extension = 'jpg';
                }

                $imageSizeForType = [];
                foreach ($frameRange as $frameNumber) {
                    $path = sprintf(
                        '%s/%s/%s.%s',
                        $video->getId(),
                        $type,
                        $frameNumber,
                        $extension
                    );

                    try {

                        $header                  = $this->requestHead(
                            $curlHandle,
                            sprintf('%s/%s', $this->frameCdnBaseUrl, $path)
                        );
                        $imageSizeForType[$path] = $header['Content-Length'];
                        $calculatedBytesInThisRun += $header['Content-Length'];
                        $progress->setMessage($this->formatBytes($calculatedBytesInThisRun), 'size');
                    } catch (\Exception $exception) {
                        $this->writeInfo(
                            $output,
                            sprintf('Failed to get %s', sprintf('%s/%s', $this->frameCdnBaseUrl, $path))
                        );
                    }
                    $progress->advance();
                }
                if (!$dryRun) {
                    $video->setImageSizesForType($type, $imageSizeForType);
                }
            }
            if (!$dryRun) {
                $this->videoFacade->save($video);
            }
        }
        $this->closeCurl($curlHandle);
        $progress->finish();
    }

    private function getHeaderFromCurlResponse($response)
    {
        $headers = [];

        $header_text = substr($response, 0, strpos($response, "\r\n\r\n"));

        foreach (explode("\r\n", $header_text) as $i => $line) {
            if ($i === 0) {
                $headers['http_code'] = $line;
            } else {
                list ($key, $value) = explode(': ', $line);

                $headers[$key] = $value;
            }
        }

        return $headers;
    }

    private function initCurl()
    {
        $curlHandle = \curl_init();
        \curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($curlHandle, CURLOPT_CONNECTTIMEOUT, 20);
        \curl_setopt($curlHandle, CURLOPT_USERAGENT, 'php/' . PHP_VERSION);

        // Only calling the head
        \curl_setopt($curlHandle, CURLOPT_HEADER, true);
        \curl_setopt($curlHandle, CURLOPT_CUSTOMREQUEST, 'HEAD');
        \curl_setopt($curlHandle, CURLOPT_NOBODY, true);

        if ($this->kernelEnvironment === 'dev') {
            \curl_setopt($curlHandle, CURLOPT_SSL_VERIFYHOST, 0);
            \curl_setopt($curlHandle, CURLOPT_SSL_VERIFYPEER, 0);
        }

        return $curlHandle;
    }

    private function closeCurl($curlHandle)
    {
        \curl_close($curlHandle);
    }

    private function requestHead($curlHandle, $url)
    {
        \curl_setopt($curlHandle, CURLOPT_URL, $url);
        $content = \curl_exec($curlHandle);

        return $this->getHeaderFromCurlResponse($content);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        $bytes = max($bytes, 0);
        $pow   = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow   = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}