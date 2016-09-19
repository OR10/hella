<?php

namespace AppBundle\Tests;

use Symfony\Bundle\FrameworkBundle;
use Symfony\Component\DomCrawler;
use Symfony\Component\HttpFoundation;

/**
 * Helper class for performing requests using a fluent interface in tests.
 */
class RequestWrapper
{
    /**
     * @var FrameworkBundle\Client
     */
    private $client;

    /**
     * @var DomCrawler\Crawler
     */
    private $crawler;

    /**
     * @var string
     */
    private $method = HttpFoundation\Request::METHOD_GET;

    /**
     * @var string
     */
    private $path;

    /**
     * @var array
     */
    private $queryParameters = [];

    /**
     * @var string[]
     */
    private $parameters = [];

    /**
     * @var array
     */
    private $files = [];

    /**
     * @var array
     */
    private $serverParameters = [];

    /**
     * @var string
     */
    private $body;

    /**
     * @var HttpFoundation\Response
     */
    private $response;

    /**
     * @param FrameworkBundle\Client $client
     * @param string                 $path
     *
     * @return RequestWrapper
     */
    public static function create(FrameworkBundle\Client $client, string $path)
    {
        return new static($client, $path);
    }

    /**
     * @param FrameworkBundle\Client $client
     * @param string                 $path
     */
    private function __construct(FrameworkBundle\Client $client, string $path)
    {
        $this->client = $client;
        $this->path   = $path;
    }

    /**
     * @param string $method
     *
     * @return RequestWrapper
     */
    public function setMethod(string $method)
    {
        $this->method = $method;

        return $this;
    }

    /**
     * @param array $queryParameters
     *
     * @return RequestWrapper
     */
    public function setQueryParameters(array $queryParameters)
    {
        $this->queryParameters = $queryParameters;

        return $this;
    }

    /**
     * @param string[] $parameters
     *
     * @return RequestWrapper
     */
    public function setParameters(array $parameters)
    {
        $this->parameters = $parameters;

        return $this;
    }

    /**
     * @param array $serverParameters
     *
     * @return $this
     */
    public function setServerParameters(array $serverParameters)
    {
        $this->serverParameters = $serverParameters;

        return $this;
    }

    /**
     * @param array $files
     *
     * @return RequestWrapper
     */
    public function setFiles(array $files)
    {
        $this->files = $files;

        return $this;
    }

    /**
     * @param $body
     *
     * @return $this
     */
    public function setBody(string $body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @param array $body
     *
     * @return RequestWrapper
     */
    public function setJsonBody(array $body)
    {
        return $this->setBody(json_encode($body));
    }

    /**
     * @return RequestWrapper
     */
    public function execute()
    {
        $uri = $this->path;

        if (!empty($this->queryParameters)) {
            $uri .= '?' . http_build_query($this->queryParameters);
        }

        $this->crawler = $this->client->request(
            $this->method,
            $uri,
            $this->parameters,
            $this->files,
            $this->serverParameters,
            $this->body
        );

        $this->response = $this->client->getResponse();

        return $this;
    }

    /**
     * @return DomCrawler\Crawler
     */
    public function getCrawler()
    {
        return $this->crawler;
    }

    /**
     * @return HttpFoundation\Response
     */
    public function getResponse()
    {
        return $this->response;
    }

    /**
     * @return array
     */
    public function getJsonResponseBody()
    {
        return json_decode($this->getResponse()->getContent(), true);
    }
}
