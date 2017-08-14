<?php
interface cscntLogHierarchicalArrayStructConsumer
{
    /**
     * Consume a given StdClass as hierarchical array structure.
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param array $data
     * @return void
     */
    public function fromHierarchicalArrayStruct($severity, $facility, $id, array $data);
}
