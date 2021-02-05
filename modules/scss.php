<?php
// extract scssphp on modules dir from https://scssphp.github.io/scssphp/, I used https://github.com/scssphp/scssphp/archive/1.3.tar.gz
require_once __DIR__.'/scssphp-1.3/scss.inc.php';

use ScssPhp\ScssPhp\Compiler;

function compileScss() {
    $gamename = 'mow';

    $scssCompiler = new Compiler();
    $scssCompiler->setFormatter('ScssPhp\\ScssPhp\\Formatter\\Compressed');

    $css = $scssCompiler->compile(file_get_contents( __DIR__.'/../'.$gamename.'.scss'));
    file_put_contents(__DIR__.'/../'.$gamename.'.css', $css);
}
