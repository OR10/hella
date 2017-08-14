<?php
return json_decode( 
    file_get_contents( 
        __DIR__ . '/produced_hierarchicalarraystruct.raw'
    ),
    1
);
