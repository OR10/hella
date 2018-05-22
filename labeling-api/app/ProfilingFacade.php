<?php

class ProfilingFacade
{
    static $enabled = false;

    static function start()
    {
        $xhprofDevider = (int)getenv('XHPROF_DIVIDER');
        if (0 < $xhprofDevider && 1 == rand(1, $xhprofDevider)) {
            self::$enabled = true;
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
}
