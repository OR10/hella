<?php
return array(
    'type' => 'File',
    'fixture' => new cscntLogFileStruct(
        'image/png',
        file_get_contents(
            __DIR__ . '/../../../images/test.png'
        )
    )
);