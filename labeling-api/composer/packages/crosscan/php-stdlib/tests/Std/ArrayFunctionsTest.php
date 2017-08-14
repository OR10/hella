<?php

namespace crosscan\Tests\Std;

use crosscan\Std;

class ArrayFunctionsTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider provideValueArrays
     */
    public function testArrayFilterNan($values, $expected)
    {
        $result = Std\ArrayFunctions::arrayFilterNan($values);

        if (is_array($result)) {
            $this->assertTrue(
                is_array($expected)
            );

            $this->assertEquals(
                array_values($expected),
                array_values($result)
            );
        } else {
            if (is_nan($expected)) {
                $this->assertTrue(is_nan($result));
            } else {
                $this->assertEquals($expected, $result);
            }
        }
    }

    /**
     * @dataProvider provideSumData
     */
    public function testArraySumNanAware($default, $values, $expected)
    {
        $result = Std\ArrayFunctions::arraySumNanAware($values, $default);

        if (is_array($result)) {
            $this->assertTrue(
                is_array($expected)
            );

            $this->assertEquals(
                array_values($expected),
                array_values($result)
            );
        } else {
            if (is_nan($expected)) {
                $this->assertTrue(is_nan($result));
            } else {
                $this->assertEquals($expected, $result);
            }
        }
    }

    /**
     * @dataProvider provideAverageData
     */
    public function testArrayAverageNanAware($default, $values, $expected)
    {
        $result = Std\ArrayFunctions::arrayAverageNanAware($values, $default);

        if (is_array($result)) {
            $this->assertTrue(
                is_array($expected)
            );

            $this->assertEquals(
                array_values($expected),
                array_values($result)
            );
        } else {
            if (is_nan($expected)) {
                $this->assertTrue(is_nan($result));
            } else {
                $this->assertEquals($expected, $result);
            }
        }
    }

    public function provideValueArrays()
    {
        return array(
            array(
                array(NAN, 14, 3),
                array(14, 3)
            ),
            array(
                array(NAN),
                array()
            ),
            array(
                array(12, -6, 1.3),
                array(12, -6, 1.3)
            )
        );
    }

    public function provideAverageData()
    {
        return array(
            array(
                NAN,
                array(NAN, 12, 4),
                8
            ),
            array(
                NAN,
                array(NAN),
                NAN
            ),
            array(
                0,
                array(NAN),
                0
            ),
            array(
                NAN,
                array(),
                NAN
            ),
            array(
                NAN,
                array(12, -6, 3),
                3
            )
        );
    }

    public function provideSumData()
    {
        return array(
            array(
                NAN,
                array(NAN, 14, 3),
                17
            ),
            array(
                NAN,
                array(NAN),
                NAN
            ),
            array(
                0,
                array(NAN),
                0
            ),
            array(
                NAN,
                array(),
                NAN
            ),
            array(
                NAN,
                array(12, -6, 1.3),
                7.3
            )
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite(__CLASS__);
    }
}
 