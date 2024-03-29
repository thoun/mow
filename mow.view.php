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
 * mow.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in mow_mow.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
  require_once( APP_BASE_PATH."view/common/game.view.php" );
  
  class view_mow_mow extends game_view {
    function getGameName() {
        return "mow";
    }

  	function build_page($viewArgs) {		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count($players);

        /*********** Place your code below:  ************/
		
		$this->tpl['MY_HAND'] = self::_("My hand");
        $this->tpl['DECK_REMAINING_CARDS'] = self::_("Remaining cards in deck");
		$this->tpl['DIRECTION'] = self::_("Direction of play:");
		$this->tpl['KEEP_DIRECTION'] = self::_("Keep direction");
		$this->tpl['CHANGE_DIRECTION'] = self::_("Change direction");
		$this->tpl['NEXT_PLAYER'] = self::_("Next player");

        /*********** Do not change anything below this line  ************/
  	}
  }
  

