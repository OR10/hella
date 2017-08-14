<?php

use crosscan\Std;

class UUIDStub extends Std\UUID
{
    public function __construct($uuid)
    {
        $this->uuid = $uuid;
    }
}
