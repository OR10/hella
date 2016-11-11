<?php

$xml = file_get_contents('LabelTool_cfg_zFAS_V01.16.xml');

$simpleXml = new SimpleXMLElement($xml);

$output = '<?xml version="1.0" encoding="utf-8"?>' . PHP_EOL .
    '<requirements xmlns="http://weblabel.hella-aglaia.com/schema/requirements">' . PHP_EOL;

foreach ($simpleXml->MetaClass as $metaClass) {
    switch ($metaClass->attributes()['Type']) {
        case 'permanently__1_instance':
            $output .= '<frame>' . PHP_EOL;
            processMeta($metaClass);
            $output .= '</frame>' . PHP_EOL;
            break;
        case 'temporarily__n_instances':
            processFrame($metaClass);
            break;
        default:
    }
}

function processMeta($metaClass)
{
    global $output;
    foreach ($metaClass->Class as $class) {
        $output .= '<!-- ' . $class->attributes()['Name'] . ' fehlt -->' . PHP_EOL;
        foreach ($class->ClassProperty as $classProperty) {
            switch ($classProperty->attributes()['Type']) {
                case 'Group':
                    processGroup($classProperty);
                    break;
                case 'Bool':
                    processBool($classProperty);
                    break;
            }
        }
        $output .= '<!-- ' . $class->attributes()['Name'] . ' fehlt ende -->' . PHP_EOL;
    }
}

function processFrame($metaClass)
{
    global $output;
    foreach ($metaClass->Class as $class) {
        $name = fixNames($class->attributes()['Name']);
        $id = slugify($name);

        $output .= '<thing id="' . $id . '" name="' . $name . '" shape="rectangle">' . PHP_EOL;
        foreach ($class as $classEntry) {
            switch ($classEntry->getName()) {
                case 'ClassProperty':
                    switch ($classEntry->attributes()['Type']) {
                        case 'Group':
                            processGroup($classEntry, $id);
                            break;
                        case 'Bool':
                            processBool($classEntry, $id);
                            break;
                    }
                    break;
                case 'SubClass':
                    processSubClassProperty($classEntry->SubClassProperty, $id);
                    break;
            }
        }
        $output .= '</thing>' . PHP_EOL;
    }
}

function processSubClassProperty($subClassProperties, $prefix)
{
    foreach ($subClassProperties as $property) {
        switch ($property->attributes()['Type']) {
            case 'Group':
                processGroup($property, $prefix);
                break;
            case 'Bool':
                processBool($property, $prefix);
                break;
        }
    }
}

function processGroup($classProperty, $prefix = '')
{
    global $output;
    $name = fixNames($classProperty->attributes()['Name']);
    $id = slugify($name);

    if ($classProperty->Selection) {
        $output .= '<class name="' . $name . '" id="' . $id . '" >' . PHP_EOL;

        foreach ($classProperty->Selection as $selection) {
            $valueName = fixNames($selection->attributes()['Value']);
            $valueId = $id . '-' . slugify($valueName);
            $valueIdPrefixed = empty($prefix) ? $valueId : $prefix . '-' . $valueId;
            $output .= '  <value name="' . $valueName . '" id="' . $valueIdPrefixed . '" />' . PHP_EOL;
        }

        $output .= '</class>' . PHP_EOL;
    }
}

function processBool($classProperty, $prefix = '')
{
    global $output;
    $name = fixNames($classProperty->attributes()['Name']);
    $id = empty($prefix) ? slugify($name) : $prefix . '-' . slugify($name);

    $output .= '<class name="' . $name . '" id="' . $id . '" >' . PHP_EOL;

    if ($classProperty->ClassProperty) {
        $output .= '  <value name="Ja" id="' . $id . '-ja" >' . PHP_EOL;
        switch ($classProperty->ClassProperty->attributes()['Type']) {
            case 'Group':
                processGroup($classProperty->ClassProperty, $id);
                break;
            case 'Bool':
                processBool($classProperty->ClassProperty, $id);
                break;
        }
        $output .= '  </value>' . PHP_EOL;
        $output .= '  <value name="Nein" id="' . $id . '-nein" />' . PHP_EOL;
    } else {
        $output .= '  <value name="Ja" id="' . $id . '-ja" />' . PHP_EOL;
        $output .= '  <value name="Nein" id="' . $id . '-nein" />' . PHP_EOL;
    }

    $output .= '</class>' . PHP_EOL;
}

function slugify($text)
{
    // replace non letter or digits by -
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);

    // transliterate
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

    // remove unwanted characters
    $text = preg_replace('~[^-\w]+~', '', $text);

    // trim
    $text = trim($text, '-');

    // remove duplicate -
    $text = preg_replace('~-+~', '-', $text);

    // lowercase
    $text = strtolower($text);

    if (empty($text)) {
        return 'n-a';
    }

    return $text;
}

function fixNames($name)
{
//    return htmlentities($name);
    return str_replace(['&', '<', '>', '"'], ['&amp;', '&lt;', '&gt;', '&quot;'], $name);
}


$output .= '</requirements>' . PHP_EOL;
file_put_contents('requirements.xml', $output);