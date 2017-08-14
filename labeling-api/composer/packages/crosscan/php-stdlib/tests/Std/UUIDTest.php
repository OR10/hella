<?php

namespace crosscan\Tests\Std;

use crosscan\Std;

class UUIDTest extends \PHPUnit_Framework_TestCase
{
    public function provideUUIDv5Data()
    {
        return array(
            array(
                'namespace' => '5cda52ff-efaf-4429-8ba0-fab0756f1f24',
                'value'     => 'crosscan 3d 000B91200108',
                'expected'  => '2fe4aa15-4061-5c10-98e1-39002c726a09',
            ),
            array(
                'namespace' => '5cda52ff-efaf-4429-8ba0-fab0756f1f24',
                'value'     => 'client type 123456',
                'expected'  => '9e1a633b-30ca-530d-954c-c7eca84a44da',
            ),
        );
    }

    public function testThatUUIDv4StillWorksSomehow()
    {
        $uuid = new Std\UUID();

        $uuidString = (string) $uuid;

        $this->assertNotNull($uuidString);
        $this->assertTrue(
            $uuid->isValid($uuidString)
        );
    }

    /**
     * @dataProvider provideUUIDv5Data
     */
    public function testGenerateUUIDv5($namespace, $value, $expectedUUID)
    {
        $uuid = new Std\UUID($namespace);

        $actualUUID = $uuid->generateUUIDv5($value);

        $this->assertSame($expectedUUID, $actualUUID);
    }

    /**
     * @expectedException \crosscan\Exception\NoValidUUID
     */
    public function testMalformedNamespaceUUIDv5Exception()
    {
        new Std\UUID('a42e31');
    }

    public function testToDashlessString()
    {
        $uuidObject = new Std\UUID();
        $uuidString = 'd2c77cdb-bb4e-433c-b390-d2c87d1e8863';

        // Unfortunately we cant use Phake's partialMock here as Phake overrides the __toString method :-(
        $uuidField = new \ReflectionProperty($uuidObject, 'uuid');
        $uuidField->setAccessible(true);
        $uuidField->setValue($uuidObject, $uuidString);

        $expected = 'd2c77cdbbb4e433cb390d2c87d1e8863';

        $this->assertSame($expected, $uuidObject->toDashlessString());
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite(__CLASS__);
    }
}
