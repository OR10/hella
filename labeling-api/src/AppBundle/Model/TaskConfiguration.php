<?php
namespace AppBundle\Model;

interface TaskConfiguration
{
    public function __construct($name, $filename, $contentType, $binaryData, $userId, $json, $date = null);

    public function getId();

    public function getName();

    public function getFile();

    public function getUserId();

    public function getJson();

    public function getFilename();

    public function getRawData();

    public function isMetaLabelingConfiguration();

    public function getType();

    public function getContentType();
}