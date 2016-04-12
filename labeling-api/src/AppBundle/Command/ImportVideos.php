<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportVideos extends Base
{
    const HTTP_HOST = 'https://192.168.222.20';
    const API_KEY   = '37b51d194a7513e45b56f6524f2d51f2';
    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var \GuzzleHttp\Client
     */
    private $httpClient;

    /**
     * @param Service\VideoImporter $videoImporterService
     */
    public function __construct(Service\VideoImporter $videoImporterService)
    {
        parent::__construct();
        $this->videoImporterService = $videoImporterService;
    }

    protected function configure()
    {
        $this->setName('annostation:import:videos')
            ->setDescription('Import a list of videos')
            ->addArgument('directory', Input\InputArgument::REQUIRED, 'Path to the video directory.')
            ->addArgument('project', Input\InputArgument::REQUIRED, 'Project name')
            ->addArgument('host', Input\InputArgument::OPTIONAL, 'Host address', self::HTTP_HOST)
            ->addArgument('apiKey', Input\InputArgument::OPTIONAL, 'Users api token', self::API_KEY)
            ->addArgument('splitLength', Input\InputArgument::OPTIONAL, 'Video split length', 0)
            ->addArgument('startFrame', Input\InputArgument::OPTIONAL, 'Video start frame', 22)
            ->addArgument('frameStepSize', Input\InputArgument::OPTIONAL, 'Video frame step size', 22)
            ->addArgument('drawingTool', Input\InputArgument::OPTIONAL, 'Video drawing tool', 'rectangle')
            ->addArgument('pedestrianMinimalHeight', Input\InputArgument::OPTIONAL, 'Video pedestrian minimal height', 22)
            ->addArgument('overflow', Input\InputArgument::OPTIONAL, 'Allow video overflow', 1);
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $this->httpClient = new \GuzzleHttp\Client([
            'base_uri' => $input->getArgument('host'),
        ]);
        $videoDirectory = $input->getArgument('directory');

        foreach (glob($videoDirectory . '/*') as $videoFile) {
            $this->writeInfo(
                $output,
                "Uploading video <comment>" . $videoFile . "</comment>"
            );
            $response = $this->httpClient->request(
                'POST',
                sprintf('/upload?apikey=%s', $input->getArgument('apiKey')),
                [
                    'verify' => false,
                    'multipart' => [
                        [
                            'name' => 'project',
                            'contents' => (string) $input->getArgument('project')
                        ],                        [
                            'name' => 'splitLength',
                            'contents' => (string) $input->getArgument('splitLength')
                        ],
                        [
                            'name' => 'frameStepSize',
                            'contents' => (string) $input->getArgument('frameStepSize')
                        ],
                        [
                            'name' => 'startFrame',
                            'contents' => (string) $input->getArgument('startFrame')
                        ],
                        [
                            'name' => 'object-labeling',
                            'contents' => '1'
                        ],
                        [
                            'name' => 'person',
                            'contents' => '1'
                        ],
                        [
                            'name' => 'drawingTool',
                            'contents' => (string) $input->getArgument('drawingTool')
                        ],
                        [
                            'name' => 'pedestrianMinimalHeight',
                            'contents' => (string) $input->getArgument('pedestrianMinimalHeight')
                        ],
                        [
                            'name' => 'overflow',
                            'contents' => (string) $input->getArgument('overflow')
                        ],
                        [
                            'name' => 'file',
                            'contents' => fopen($videoFile, 'r')
                        ],
                    ]
                ]
            );
        }
    }
}