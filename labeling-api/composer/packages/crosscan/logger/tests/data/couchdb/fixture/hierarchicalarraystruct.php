<?php
return array(
    'type' => 'HierarchicalArrayStruct',
    'fixture' => json_decode(
        file_get_contents(
            __DIR__ . '/../expected/hierarchicalarraystruct.json'
        ),
        true
    )
);