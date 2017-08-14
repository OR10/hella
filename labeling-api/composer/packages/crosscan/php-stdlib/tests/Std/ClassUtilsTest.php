<?php

namespace crosscan\Tests\Std;

class ClassUtilsTest extends \PHPUnit_Framework_TestCase
{
    public function classNameProvider()
    {
        return array(
            array(
                new \crosscan\Tests\Std\Mocks\Bar\Baz(), 'Baz',
            ),
            array(
                new \crosscan\Tests\Std\Mocks\Foo(), 'Foo',
            ),
            array(
                new \TestMockFoo(), 'TestMockFoo',
            ),
        );
    }

    /**
     * @param mixed $className
     * @param string $expectedExtraction
     *
     * @dataProvider classNameProvider
     */
    public function testExtractClassName($class, $expectedExtraction)
    {
        $classUtil = new \crosscan\Std\ClassUtils();

        $this->assertEquals(
            $classUtil->extractClassName($class),
            $expectedExtraction
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite(__CLASS__);
    }
}
