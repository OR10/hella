<?php

namespace crosscan\Exception;

class NoValidUUID extends \Exception
{
    public $uuid;

    public function __construct($uuid)
    {
        $this->uuid = $uuid;

        parent::__construct(
            sprintf(
                'The given string "%s" is not a valid UUID',
                $uuid
            )
        );
    }
}
 