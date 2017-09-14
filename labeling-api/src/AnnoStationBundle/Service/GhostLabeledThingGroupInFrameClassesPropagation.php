<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;


class GhostLabeledThingGroupInFrameClassesPropagation
{
    /**
     * @param Model\LabelingTask                                $task
     * @param AnnoStationBundleModel\LabeledThingGroupInFrame[] $labeledThingGroupInFrames
     *
     * @return array
     */
    public function propagateGhostClasses(Model\LabelingTask $task, array $labeledThingGroupInFrames)
    {
        $this->sortLabeledThingGroupInFrames($labeledThingGroupInFrames);
        $startFrameIndex = $labeledThingGroupInFrames[0]->getFrameIndex();
        $endFrameIndex   = $labeledThingGroupInFrames[count($labeledThingGroupInFrames)-1]->getFrameIndex();

        $frameMapping = array_filter(
            $task->getFrameNumberMapping(),
            function($frameIndex) use ($startFrameIndex, $endFrameIndex) {
                return $startFrameIndex <= $frameIndex && $frameIndex <= $endFrameIndex;
            },
            ARRAY_FILTER_USE_KEY
        );

        $labeledThingGroupInFrames = $this->getLabeledThingGroupInFramesWithFrameIndex($labeledThingGroupInFrames);
        $values = [];
        $previousLabeledThingGroupInFrame = null;
        foreach ($frameMapping as $frameIndex => $frameNumber) {
            if (isset($labeledThingGroupInFrames[$frameIndex]) && !empty($labeledThingGroupInFrames[$frameIndex]->getClasses())) {
                $values[$frameIndex] = $labeledThingGroupInFrames[$frameIndex];
                $previousLabeledThingGroupInFrame = $labeledThingGroupInFrames[$frameIndex];
            }else{
                $values[$frameIndex] = $previousLabeledThingGroupInFrame->copy($frameIndex);
            }
        }

        return $values;
    }

    /**
     * @param array $labeledThingGroupInFrames
     */
    private function sortLabeledThingGroupInFrames(array &$labeledThingGroupInFrames)
    {
        usort($labeledThingGroupInFrames, function (AnnoStationBundleModel\LabeledThingGroupInFrame $item1, AnnoStationBundleModel\LabeledThingGroupInFrame $item2) {
            return $item1->getFrameIndex() <=> $item2->getFrameIndex();
        });
    }

    /**
     * @param $labeledThingGroupInFrames
     * @return array
     */
    private function getLabeledThingGroupInFramesWithFrameIndex($labeledThingGroupInFrames)
    {
        $result = [];
        foreach($labeledThingGroupInFrames as $labeledThingGroupInFrame){
            $result[$labeledThingGroupInFrame->getFrameIndex()] = $labeledThingGroupInFrame;
        }

        return $result;
    }
}
