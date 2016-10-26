<?php
function libxml_display_error($error)
{
    $return = "";
    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "Warning $error->code: ";
            break;
        case LIBXML_ERR_ERROR:
            $return .= "Error $error->code: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "Fatal Error $error->code: ";
            break;
    }
    $return .= trim($error->message);
    if ($error->file) {
        $return .=    " in $error->file";
    }
    $return .= " on line $error->line\n";

    return $return;
}

function libxml_display_errors() {
    $errors = libxml_get_errors();
    foreach ($errors as $error) {
        print libxml_display_error($error);
    }
    libxml_clear_errors();
}

// Enable user error handling
libxml_use_internal_errors(true);

$document = new DOMDocument();
$document->load('requirements.xml');
if (!$document->relaxNGValidate('requirements.rng')) {
    libxml_display_errors();
} else {
    echo "Requirements are VALID!\n";
}


