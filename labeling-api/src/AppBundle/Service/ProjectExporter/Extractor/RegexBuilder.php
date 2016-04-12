<?php
namespace AppBundle\Service\ProjectExporter\Extractor;

class RegexBuilder
{
    private $regexPattern;

    private $groupName;

    private $default;

    /**
     * @param mixed $regexPattern
     */
    public function setRegexPattern($regexPattern)
    {
        $this->regexPattern = $regexPattern;
    }

    /**
     * @param mixed $groupName
     */
    public function setGroupName($groupName)
    {
        $this->groupName = $groupName;
    }

    /**
     * @param mixed $default
     */
    public function setDefault($default)
    {
        $this->default = $default;
    }

    /**
     * @return mixed
     */
    public function getRegexPattern()
    {
        return $this->regexPattern;
    }

    /**
     * @return mixed
     */
    public function getGroupName()
    {
        return $this->groupName;
    }

    /**
     * @return mixed
     */
    public function getDefault()
    {
        return $this->default;
    }

    public function getRegexExtractor()
    {
        return new Regex($this);
    }

}