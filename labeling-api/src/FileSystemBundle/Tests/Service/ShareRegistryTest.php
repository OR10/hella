<?php

namespace FileSystemBundle\Tests\Service;

use FileSystemBundle\Service\ShareRegistry;
use FileSystemBundle\Tests\BaseTestCase;

/**
 * @group DataStation
 * @group UnitTests
 */
class ShareRegistryTest extends BaseTestCase
{

    public function testShareRegistryReturnsValidShare()
    {
        $share = [
            'volume01' => [
                'rootDirectory'     => '/tmp',
                'userRootDirectory' => 'X:\tmp',
            ],
        ];

        $registry = new ShareRegistry($share);
        $volume   = $registry->getShare('volume01');

        $this->assertEquals('/tmp', $volume->getRootDirectory());
        $this->assertEquals('X:\tmp', $volume->getUserRootDirectory());
    }

    public function testShareRegistryThrowsExceptionOnInvalidShare()
    {
        $this->setExpectedException(\InvalidArgumentException::class);

        $share    = [];
        $registry = new ShareRegistry($share);
        $registry->getShare('invalid');
    }
}
