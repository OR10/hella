<?php
class cscntLoggerCollectionTests extends PHPUnit_Framework_TestCase
{
    protected $collection = null;

    public function setUp() 
    {
        $this->collection = $this->getMockForAbstractClass( 'cscntLogCollection' );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testUnknownPropertyRead() 
    {
        $this->collection->foobar;
    }

    public function testUnknownPropertyWrite() 
    {
        $this->collection->foobar = "baz";
    }

    public function testPropertyStored() 
    {
        $this->collection->foobar = "baz";
        $this->assertEquals( 
            "baz",
            $this->collection->foobar
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testUnknownOffsetRead() 
    {
        $this->collection["foobar"];
    }

    public function testUnknownOffsetWrite() 
    {
        $this->collection['foobar'] = "baz";
    }

    public function testOffsetStored() 
    {
        $this->collection["foobar"] = "baz";
        $this->assertEquals( 
            "baz",
            $this->collection["foobar"]
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testOffsetUnset() 
    {
        $this->collection["foobar"] = "baz";
        unset( $this->collection["foobar"] );
        $this->collection["foobar"];
    }

    public function testDynamicArrayAccess() 
    {
        $this->collection[] = "foo";
        $this->assertEquals( 
            "foo",
            $this->collection[0]
        );
    }

    public function testMixedArrayAccess() 
    {
        $this->collection[] = "foo";
        $this->collection["bar"] = "baz";
        $this->collection[] = 42;

        $this->assertEquals( 
            "foo",
            $this->collection[0]
        );

        $this->assertEquals( 
            "baz",
            $this->collection["bar"]
        );

        $this->assertEquals( 
            42,
            $this->collection[1]
        );
    }

    public function testCountable() 
    {
        $this->assertEquals(
            0,
            count( $this->collection )
        );

        $this->collection["foo"] = "bar";

        $this->assertEquals(
            1,
            count( $this->collection )
        );
    }

    public function testIterable() 
    {
        $this->collection[] = "foo";
        $this->collection[] = "bar";

        $called = 0;
        foreach( $this->collection as $key => $value ) 
        {
            switch( $key ) 
            {
                case 0:
                    $this->assertEquals( "foo", $value );
                break;
                case 1:
                    $this->assertEquals( "bar", $value );
                break;
                default:
                    $this->fail( "Invalid key: $key" );
            }
            ++$called;
        }

        $this->assertEquals( 2, $called );
    }

    public function testRawArrayAccess()
    {
        $this->collection[] = "foo";
        $this->collection["bar"] = "baz";
        $this->collection[] = 42;

        $raw = $this->collection->getRawArray();

        $this->assertEquals(
            "foo",
            $raw[0]
        );

        $this->assertEquals(
            "baz",
            $raw["bar"]
        );

        $this->assertEquals(
            42,
            $raw[1]
        );
    }

    public function testCollectionImmutableFromRawArray()
    {
        $this->collection[] = "foo";
        $this->collection['foo'] = "bar";

        $raw = $this->collection->getRawArray();

        $raw['foo'] = 'not bar';
        $raw['baz'] = 'blub';

        $this->assertEquals(
            array( 'foo', 'foo' => 'bar' ),
            $this->collection->getRawArray()
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
