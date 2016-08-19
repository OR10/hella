<?php
namespace AppBundle\Service\TaskExporter\Extractor;

use AppBundle\Model;

class Regex
{
    private $regexPattern;

    private $groupName;

    private $default = NAN;

    public function __construct(RegexBuilder $regexBuilder)
    {
        $this->regexPattern = $regexBuilder->getRegexPattern();
        $this->groupName = $regexBuilder->getGroupName();
        $this->default = $regexBuilder->getDefault();
    }

    public function extract(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $classesToExtract = array();

        if ($labeledThingInFrame->getGhostClasses() !== null) {
            $classesToExtract = $labeledThingInFrame->getGhostClasses();
        } else {
            $classesToExtract = $labeledThingInFrame->getClasses();
        }

        foreach ($classesToExtract as $class) {
            preg_match($this->regexPattern, $class, $matches);
            if (isset($matches[$this->groupName])) {
                return $matches[$this->groupName];
            }
        }

        return $this->default;
    }
}
