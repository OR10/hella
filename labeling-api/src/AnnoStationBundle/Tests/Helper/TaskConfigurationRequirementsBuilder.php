<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class TaskConfigurationRequirementsBuilder
{
    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * @var string
     */
    private $name;

    /**
     * @var string
     */
    private $filename;

    /**
     * @var string
     */
    private $contentType;

    /**
     * @var string
     */
    private $binaryData;

    /**
     * @var string
     */
    private $userId;

    /**
     * @var string
     */
    private $json;

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $binaryData
     * @param                                     $userId
     * @param string                              $name
     * @param string                              $filename
     * @param string                              $contentType
     * @param array                               $json
     *
     * @return TaskConfigurationRequirementsBuilder
     */
    public static function create(
        AnnoStationBundleModel\Organisation $organisation,
        $binaryData,
        $userId,
        $name = 'foobar',
        $filename = 'foobar.xml',
        $contentType = 'application/xml',
        $json = []
    ) {
        $taskConfiguration = new self();

        return $taskConfiguration->withOrganisation($organisation)
            ->withName($name)
            ->withFilename($filename)
            ->withContentType($contentType)
            ->withBinaryData($binaryData)
            ->withUserId($userId)
            ->withJson(\json_encode($json));
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return $this
     */
    public function withOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->organisation = $organisation;

        return $this;
    }

    /**
     * @param $name
     *
     * @return $this
     */
    public function withName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @param $filename
     *
     * @return $this
     */
    public function withFilename($filename)
    {
        $this->filename = $filename;

        return $this;
    }

    /**
     * @param $contentType
     *
     * @return $this
     */
    public function withContentType($contentType)
    {
        $this->contentType = $contentType;

        return $this;
    }

    /**
     * @param $binaryData
     *
     * @return $this
     */
    public function withBinaryData($binaryData)
    {
        $this->binaryData = $binaryData;

        return $this;
    }

    /**
     * @param $userId
     *
     * @return $this
     */
    public function withUserId($userId)
    {
        $this->userId = $userId;

        return $this;
    }

    /**
     * @param $json
     *
     * @return $this
     */
    public function withJson($json)
    {
        $this->json = $json;

        return $this;
    }

    /**
     * @return Model\TaskConfiguration\RequirementsXml
     */
    public function build()
    {
        $taskConfiguration = new Model\TaskConfiguration\RequirementsXml(
            $this->organisation,
            $this->name,
            $this->filename,
            $this->contentType,
            $this->binaryData,
            $this->userId,
            $this->json
        );

        return $taskConfiguration;
    }
}
