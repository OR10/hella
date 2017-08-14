<?php

namespace crosscan\Std;

class ClassUtils
{
    /**
     * Returns the last part of namespaces class.
     *
     * @param $object
     * @return string
     */
    public function extractClassName($object)
    {
        $fullQualifiedClassName = get_class($object);
        $splittedClassname = explode("\\", $fullQualifiedClassName);
        return $splittedClassname[count($splittedClassname) - 1];
    }
}
