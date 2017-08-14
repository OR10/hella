<?php

namespace crosscan\Tests\Std\ImageMetadata;

class ImageMetadataTest extends \PHPUnit_Framework_TestCase
{
    protected $metadata = null;

    public function setUp() 
    {
        $this->metadata = $this->getMockForAbstractClass( 
            '\crosscan\Std\ImageMetadata\ImageMetadata'
        );
    }

    public function propertyProvider() 
    {
        return array( 
            array( "width" ),
            array( "height" ),
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyPermission
     * @dataProvider propertyProvider
     */
    public function testPropertyWriteAccessDenied( $property ) 
    {
        $this->metadata->$property = "foo";
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyReadAccessDenied() 
    {
        $this->metadata->foobar;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyWriteAccessDenied() 
    {
        $this->metadata->foobar = "baz";
    }

    /**
     * @dataProvider propertyProvider
     */
    public function testAbstractGetterMethodsCalledDuringFirstPropertyAccess( $property ) 
    {
        $this->metadata->expects( $this->once() )
            ->method( 'get' . ucfirst( $property ) )
            ->will( $this->returnValue( 23 ) );

        $this->assertEquals( 
            23, 
            $this->metadata->$property
        );
    }

    /**
     * @dataProvider propertyProvider
     */
    public function testCalculatedValuesCachedProperly( $property ) 
    {
        $this->metadata->expects( $this->once() )
            ->method( 'get' . ucfirst( $property ) )
            ->will( $this->returnValue( 23 ) );

        $this->assertEquals( 
            23, 
            $this->metadata->$property
        );

        $this->assertEquals( 
            23, 
            $this->metadata->$property
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
