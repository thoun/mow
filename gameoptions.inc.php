<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * mow implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * mow game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in mow.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = [
    100 => [
        'name' => totranslate('Simple version (2008 edition)'),
        'values' => [
            1 => [
                'name' => totranslate('No'), 
                'description' => totranslate('Standard rules')
            ],
            2 => [
                'name' => totranslate('Yes'), 
                'description' => totranslate('No farmer, no card swap, no special rule when all special cows are collected'),
                'tmdisplay' => totranslate('Simple version (2008 edition)'),
            ],
        ],
    ],
];

