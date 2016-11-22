<?php

namespace AppBundle\Tests\Service;

use AppBundle\Service;
use AppBundle\Tests;

class XmlValidator extends Tests\KernelTestCase
{
    /**
     * @var Service\XmlValidator
     */
    private $xmlValidatorService;

    public function testValidXmlFile()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/XmlValidatorTestFiles/valid.xml');

        $this->assertTrue($this->xmlValidatorService->isXmlValid($xml));
    }

    public function testInvalidXmlFile()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/XmlValidatorTestFiles/invalid.xml');

        $this->assertFalse($this->xmlValidatorService->isXmlValid($xml));
    }

    public function setUpImplementation()
    {
        $this->xmlValidatorService = $this->getAnnostationService('service.simple_xml_validator');
    }
}
