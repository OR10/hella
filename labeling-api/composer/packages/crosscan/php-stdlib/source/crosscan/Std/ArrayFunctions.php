<?php

namespace crosscan\Std;

class ArrayFunctions
{
    /**
     * @param int[]|float[] $values
     *
     * @return int|float[]
     */
    public static function arrayFilterNan(array $values)
    {
        return array_filter(
            $values,
            function ($value) {
                return !is_nan($value);
            }
        );
    }

    /**
     * Calculates the average over the given array's values ignoring all NAN entries.
     * If no valid entries are available the given default will be returned.
     *
     * @param int[]|float[] $values
     * @param mixed         $emptyDefault default NAN
     *
     * @return int|float
     */
    public static function arraySumNanAware(array $values, $emptyDefault = NAN)
    {
        $filteredValues = self::arrayFilterNan($values);

        if (empty($filteredValues)) {
            return $emptyDefault;
        }

        return array_sum($filteredValues);
    }

    /**
     * Summarizes the given array's values ignoring all NAN entries. If no valid entries are available the given default
     * will be returned.
     *
     * @param int[]|float[] $values
     * @param mixed         $emptyDefault default NAN
     *
     * @return float
     */
    public static function arrayAverageNanAware(array $values, $emptyDefault = NAN)
    {
        $filteredValues = self::arrayFilterNan($values);

        if (empty($filteredValues)) {
            return $emptyDefault;
        }

        return array_sum($filteredValues) / count($filteredValues);
    }
}
