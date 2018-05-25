<?php

class ProfilingFacade
{
    static $notProduction =  false;
    static $enabled = false;

    static function start($notProduction = false)
    {
        self::$notProduction = $notProduction;
        $xhprofDevider = (int)getenv('XHPROF_DIVIDER');
        if ((0 < $xhprofDevider && 1 == rand(1, $xhprofDevider))) {
            self::$enabled = true;
            tideways_xhprof_enable(TIDEWAYS_XHPROF_FLAGS_MEMORY | TIDEWAYS_XHPROF_FLAGS_CPU);
        } elseif (self::$notProduction) {
            tideways_xhprof_enable(TIDEWAYS_XHPROF_FLAGS_MEMORY | TIDEWAYS_XHPROF_FLAGS_CPU);
        }
    }

    static function stop(string $postfix)
    {
        if (self::$enabled) {
            $data = tideways_xhprof_disable();
            $profFolder = sys_get_temp_dir();
            if (!file_exists($profFolder)) {
                mkdir($profFolder, 0777, true);
            }
            file_put_contents($profFolder . "/" . uniqid() . ".{$postfix}.xhprof", serialize($data));
        }
    }

    static function stopAbnormally(string $postfix)
    {
        if (self::$notProduction) {
            $data = tideways_xhprof_disable();
            $profFolder = sys_get_temp_dir();
            if (!file_exists($profFolder)) {
                mkdir($profFolder, 0777, true);
            }
            file_put_contents($profFolder . "/" . uniqid() . "error.{$postfix}.xhprof", serialize($data));
        }
    }
}
