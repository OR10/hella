<?php

namespace AppBundle\Service;

use crosscan\Std;

/**
 * Class UuidGenerator
 *
 * Simple service to generate UUIDs. This is useful to have in a separate service so we can simply replace it for
 * testing purposes.
 *
 * @package AppBundle\Service
 */
class UuidGenerator
{
    /**
     * @return string
     */
    public function generateUuid()
    {
        $uuid = new Std\UUID();

        return $uuid->toDashlessString();
    }

    /**
     * @param string   $namespace
     * @param string[] $name
     *
     * @return string
     */
    public function generateUuidV5(string $namespace, string ... $name)
    {
        $uuid = new Std\UUID($namespace);

        return $uuid->generateUUIDv5(implode("-", $name));
    }
}
