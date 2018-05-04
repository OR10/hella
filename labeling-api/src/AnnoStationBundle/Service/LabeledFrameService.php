<?php
namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\LabeledFrame;

class LabeledFrameService
{

    public function getFrameEmptyAttribute(array $labeledFrames)
    {
        $lFrame = [];
        $availableAttr = [
            'FullFrame-Yes' => 'Full frame',
            'FullFrame-No' => 'Full frame',
            'day' => 'Time of day',
            'night' => 'Time of day',
            'twilight' => 'Time of day',
            'dry' => 'Road cover',
            'wet' => 'Road cover',
            'snowcover' => 'Road cover',
            'city' => 'Road type',
            'highway' => 'Road type',
            'ruralRoad' => 'Road type',
            'clear' => 'Sky',
            'lowSun' => 'Sky',
            'overcast' => 'Sky',
            'partlyCloudy' => 'Sky',
            'inTunnel' => 'Sky',
            'undefined' => 'Sky',
            'rain' => 'Precipitation',
            'snow' => 'Precipitation'
        ];
        $needAttribute = [
            'Full frame',
            'Time of day',
            'Road cover',
            'Road type',
            'Sky',
            'Precipitation'
        ];
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
                    $lFrame[$labeledFrame->getFrameIndex()] = implode(', ',array_diff($needAttribute, $attrExist));
                } else {
                    $lFrame[$labeledFrame->getFrameIndex()] = implode(', ',$needAttribute);
                }
            }
        } else {
            $lFrame[0] = implode(', ',$needAttribute);
        }

        return (!empty($lFrame)) ? $lFrame : null;
    }
}