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
 * material.inc.php
 *
 * mow game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

$this->special_labels = [
	0 => 0,
	1 => 16,
	2 => 21, // <>
	3 => 22, // <>
	4 => 70, // /\
	5 => 90, // /\
];

// 1 : before
// 2 : before or after
// 3 : after
// 9 : end of hand
$this->farmers_placement = [
	1 => 2,
	2 => 2,
	3 => 2,
	4 => 1,
	5 => 2,
	6 => 2,
	7 => 2,
	8 => 3,
	9 => 2,
	10 => 9,
];



