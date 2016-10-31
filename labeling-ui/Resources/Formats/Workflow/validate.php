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

function validateIds($document)
{
    $xpath = new DOMXPath($document);
    $idAttributes = $xpath->query('//@id');
    $attributeList = array();
    foreach($idAttributes as $idAttribute)
    {
        $attributeList[] = $idAttribute->value;
    }

    return count(array_unique($attributeList)) === count($attributeList);
}

$document = new DOMDocument();
$document->load('workflow.xml');
if (!$document->relaxNGValidate('workflow.rng')) {
    libxml_display_errors();
    exit(1);
} else {
    echo "Workflow structure is VALID!\n";
}

if (!validateIds($document)) {
    echo "Workflow Ids are INVALID!\n";
    exit(2);
} else {
    echo "Workflow Ids are VALID!\n";
}
