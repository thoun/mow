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


$this->colors = array(
    0 => array( 'name' => clienttranslate('green'),
                'nametr' => self::_('green') ),
    1 => array( 'name' => clienttranslate('yellow'),
                'nametr' => self::_('yellow') ),
    2 => array( 'name' => clienttranslate('orange'),
                'nametr' => self::_('orange') ),
    3 => array( 'name' => clienttranslate('red'),
                'nametr' => self::_('red') ),
	5 => array( 'name' => clienttranslate('purple'),
                'nametr' => self::_('purple') )
);

$this->values_label = array(
	0 => clienttranslate('blocking'),
	1 => '1',
    2 => '2',
    3 => '3',
    4 => '4',
    5 => '5',
    6 => '6',
    7 => '7',
    8 => '8',
    9 => '9',
    10 => '10',
	11 => '11',
	12 => '12',
	13 => '13',
	14 => '14',
	15 => '15',
	16 => clienttranslate('blocking'),
	21 => clienttranslate('slowpoke'),
	22 => clienttranslate('slowpoke'),
	70 => clienttranslate('acrobatic'),
	90 => clienttranslate('acrobatic')
);

$this->special_labels = array(
	0 => 0,
	1 => 16,
	2 => 21,
	3 => 22,
	4 => 70,
	5 => 90
);



