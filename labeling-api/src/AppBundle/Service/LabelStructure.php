<?php
namespace AppBundle\Service;

use AppBundle\Model;

/**
 * Service handling LabelStructure related operations
 */
class LabelStructure
{
    /**
     * @param string $type
     * @param string $instruction
     *
     * @return array
     */
    public function getLabelStructureForTypeAndInstruction($type, $instruction)
    {
        if ($type === Model\LabelingTask::TYPE_META_LABELING) {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s.json',
                    __DIR__,
                    $type
                )
            );
        } else {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-%s.json',
                    __DIR__,
                    $type,
                    $instruction
                )
            );
        }

        return json_decode($structure, true);
    }

    /**
     * @param string $type
     * @param string $instruction
     *
     * @return array
     */
    public function getLabelStructureUiForTypeAndInstruction($type, $instruction)
    {
        if ($type === Model\LabelingTask::TYPE_META_LABELING) {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-ui.json',
                    __DIR__,
                    $type
                )
            );
        } else {
            $structure = file_get_contents(
                sprintf(
                    '%s/../Resources/LabelStructures/%s-%s-ui.json',
                    __DIR__,
                    $type,
                    $instruction
                )
            );
        }

        return json_decode($structure, true);
    }
}
