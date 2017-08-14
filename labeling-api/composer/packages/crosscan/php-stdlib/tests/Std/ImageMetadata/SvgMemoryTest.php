<?php

namespace crosscan\Tests\Std\ImageMetadata;

use crosscan\Std\ImageMetadata;

class SvgMemoryTest extends \PHPUnit_Framework_TestCase
{
    public function imageProvider() 
    {
        $images = array( 
            'test_exact.svg' => array( 
                'width' => 64,
                'height' => 64,
            ),
            'test_rounded.svg' => array( 
                'width' => 128,
                'height' => 128,
            ),
        );

        $results = array();

        foreach( $images as $file => $metadata ) 
        {
            foreach( $metadata as $property => $value ) 
            {
                $results[] = array( 
                    __DIR__ . '/images/' . $file,
                    $property,
                    $value
                );
            }
        }
        
        return $results;
    }

    /**
     * @dataProvider imageProvider
     */
    public function testMetadataExtraction( $image, $property, $value ) 
    {
        $metadata = new \crosscan\Std\ImageMetadata\SvgMemory(
            file_get_contents( $image )
        );

        $this->assertEquals( 
            $value,
            $metadata->$property
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
