<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Tests;
use AppBundle\Helper;

class TaskConfigurationXmlConverterTest extends Tests\KernelTestCase
{
    public function provideValidXml()
    {
        return array(
            array(
                <<<'EOF'
<?xml version="1.0" encoding="UTF-8" ?>
<labelTaskConfig shape="rectangle">
  <class id="type-id" name="type-name">
    <value id="car-id" name="car-name"/>
    <value id="truck-id" name="truck-name"/>
  </class>
  <class id="occlusion-id" name="occlusion-name">
    <value id="occlusion-25-id" name="occlusion-25-name"/>
    <value id="occlusion-50-id" name="occlusion-50-name"/>
    <value id="occlusion-75-id" name="occlusion-75-name"/>
    <value id="occlusion-100-id" name="occlusion-100-name"/>
  </class>
</labelTaskConfig>
EOF
            ,
            ),
        );
    }

    public function provideLabelStructure()
    {
        return array(
            array(
                array(
                    'name'     => 'root',
                    'children' => array(
                        array(
                            'name'     => 'type-id',
                            'children' => array(
                                array('name' => 'car-id'),
                                array('name' => 'truck-id'),
                            ),
                        ),
                        array(
                            'name'     => 'occlusion-id',
                            'children' => array(
                                array('name' => 'occlusion-25-id'),
                                array('name' => 'occlusion-50-id'),
                                array('name' => 'occlusion-75-id'),
                                array('name' => 'occlusion-100-id'),
                            ),
                        ),
                    ),
                ),
            ),
        );
    }

    public function provideLabelStructureUi()
    {
        return array(
            array(
                array(
                    'type-id' => array('challenge' => 'type-name'),
                    'occlusion-id' => array('challenge' => 'occlusion-name'),
                    'car-id' => array('response' => 'car-name'),
                    'truck-id' => array('response' => 'truck-name'),
                    'occlusion-25-id' => array('response' => 'occlusion-25-name'),
                    'occlusion-50-id' => array('response' => 'occlusion-50-name'),
                    'occlusion-75-id' => array('response' => 'occlusion-75-name'),
                    'occlusion-100-id' => array('response' => 'occlusion-100-name'),
                )
            ),
        );
    }

    public function provideValidXmlWithLabelStructure() {
        $validXml = $this->provideValidXml();
        $labelStructure = $this->provideLabelStructure();
        $mergedRows = array();
        foreach($validXml as $rowIndex => $row) {
            $mergedRows[$rowIndex] = array_merge($validXml[$rowIndex], $labelStructure[$rowIndex]);
        }

        return $mergedRows;
    }

    public function provideValidXmlWithLabelStructureUi() {
        $validXml = $this->provideValidXml();
        $labelStructureUi = $this->provideLabelStructureUi();
        $mergedRows = array();
        foreach($validXml as $rowIndex => $row) {
            $mergedRows[$rowIndex] = array_merge($validXml[$rowIndex], $labelStructureUi[$rowIndex]);
        }

        return $mergedRows;
    }

    public function provideInvalidXml()
    {
        return array(
            array(
                <<<'EOF'
<?xml version="1.0" encoding="UTF-8" ?>
<labelTaskConfig shape="rectangle">
  <class id="type-id" id="type-name">
    <value id="car-id" name="car-name"/>
    <value id="truck-id" name="truck-name"/>
  </class>
  <class id="occlusion-id" name="occlusion-name">
    <value id="occlusion-25-id" name="occlusion-25-name"/>
    <value id="occlusion-50-id" name="occlusion-50-name"/>
    <value id="occlusion-75-id" name="occlusion-75-name"/>
    <value id="occlusion-100-id" name="occlusion-100-name"/>
</labelTaskConfig>
EOF
            ,
            ),
        );
    }

    private function createConverter($xml)
    {
        return new Helper\TaskConfigurationXmlConverter($xml);
    }

    public function setUpImplementation()
    {
    }

    /**
     * @dataProvider provideValidXml
     */
    public function testLoadValidXml($xml)
    {
        try {
            $converter = $this->createConverter($xml);
        } catch (\DOMException $e) {
            $this->fail('Exception thrown during xml loading.');
        }
    }

    /**
     * @dataProvider provideInvalidXml
     * @expectedException \DOMException
     */
    public function testDoNotLoadInvalidXml($xml)
    {
        $converter = $this->createConverter($xml);
    }

    /**
     * @dataProvider provideValidXmlWithLabelStructure
     */
    public function testConvertToLabelStructure($xml, $labelStructure)
    {
        $converter = $this->createConverter($xml);
        $this->assertEquals(
            $labelStructure,
            $converter->getLabelStructure()
        );
    }

    /**
     * @dataProvider provideValidXmlWithLabelStructureUi
     */
    public function testConvertToLabelStructureUi($xml, $labelStructureUi)
    {
        $converter = $this->createConverter($xml);
        $this->assertEquals(
            $labelStructureUi,
            $converter->getLabelStructureUi()
        );
    }
}