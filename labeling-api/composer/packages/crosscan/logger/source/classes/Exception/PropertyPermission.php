<?php

class cscntPropertyPermissionException extends Exception
{
    const READ    = 1;
    const WRITE   = 2;
    const EXECUTE = 4;
    const CHANGE  = 8;
    const REMOVE  = 16;

    public $filename;
    public $permission;

    public function __construct( $filename, $permission )
    {
        $operations = array(
            '1'  => 'opened for reading',
            '2'  => 'opened for writing',
            '4'  => 'executed',
            '8'  => 'changed',
            '16' => 'removed',
        );

        $this->filename   = $filename;
        $this->permission = $permission;

        parent::__construct(
            sprintf(
                'The file %s could not be %s.',
                $filename,
                $operations[$permission]
            )
        );
    }
}