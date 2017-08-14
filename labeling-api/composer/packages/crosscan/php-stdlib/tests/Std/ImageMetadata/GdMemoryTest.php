<?php

namespace crosscan\Tests\Std\ImageMetadata;

class GdMemoryTest extends \PHPUnit_Framework_TestCase
{
    public function imageProvider() 
    {
        $images = array( 
            'test.png' => array( 
                'width' => 64,
                'height' => 64,
            ),
            'test.jpg' => array( 
                'width' => 64,
                'height' => 64,
            ),
            'test.gif' => array( 
                'width' => 64,
                'height' => 64,
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

    protected function imageFormatSupported( $image ) 
    {
        $pathinfo = pathinfo( $image );
        $extension = $pathinfo['extension'];
        $gdinfo = gd_info();

        switch( $extension ) 
        {
            case 'gif':
                return $gdinfo["GIF Read Support"];
            case 'jpg':
                return $gdinfo["JPEG Support"];
            case 'png':
                return $gdinfo["PNG Support"];
            default:
                return false;
        }
    }

    /**
     * @dataProvider imageProvider
     */
    public function testMetadataExtraction( $image, $property, $value ) 
    {
        if ( $this->imageFormatSupported( $image ) !== true ) 
        {
            $this->markTestSkipped( "Image format of '$image' is not supported by your PHP version." );
            return;
        }

        $metadata = new \crosscan\Std\ImageMetadata\GdMemory(
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
