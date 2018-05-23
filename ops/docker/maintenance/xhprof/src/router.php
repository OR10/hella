<?php
ini_set('display_errors',1);

if (preg_match('/\.(?:png|jpg|jpeg|gif)$/', $_SERVER["REQUEST_URI"])) {
    return false;    // serve the requested resource as-is.
} elseif (false !== strpos($_SERVER['REQUEST_URI'], 'callgraph.php')) {
    require "/code/xhprof_html/callgraph.php";
} else {
    require "/code/xhprof_html/index.php";
}
