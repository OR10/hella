<?php
namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\LabeledFrame;

class LabeledFrameService
{

    /**
     * @param array $labeledFrames
     * @param array $availableAttr
     * @param array $needAttribute
     * @return string[]|null
     */
    public function getFrameEmptyAttribute(array $labeledFrames, array $availableAttr, array $needAttribute)
    {
        $lFrame = [];
        $attrExist = [];
        if ($labeledFrames) {
            foreach ($labeledFrames  as $labeledFrame) {
                $frameAttribute = $labeledFrame->getClasses();
                if (is_array($frameAttribute)) {
                    foreach ($frameAttribute as $attribute) {
                        if(array_key_exists($attribute, $availableAttr)) {
                            $attrExist[] = $availableAttr[$attribute];
                        }
                    }
                }
                if(!empty($attrExist)) {
                    $lFrame[] = implode(', ', array_diff($needAttribute, $attrExist));
                } else {
                    $lFrame[] = implode(', ',$needAttribute);
                }
            }
        } else {
            $lFrame[0] = implode(', ',$needAttribute);
        }

        return (strlen($lFrame[0]) != 0 ) ? $lFrame : null;
    }

}