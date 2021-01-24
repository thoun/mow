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
  
  class view_mow_mow extends game_view
  {
    function getGameName() {
        return "mow";
    }    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );
        $currentPlayerId = $this->game->getCurrentPlayerIdForDirection();
        $playerIndex = array_search($currentPlayerId, array_column(array_values($players), 'player_id'));
        $player_before = array_values($players)[$playerIndex === 0 ? $players_nbr-1 : $playerIndex-1];
        $player_after = array_values($players)[$playerIndex === $players_nbr-1 ? 0 : $playerIndex+1];
        

        /*********** Place your code below:  ************/

		
		$this->tpl['THE_HERD'] = self::_("The Herd");
		$this->tpl['MY_HAND'] = self::_("My hand");
		$this->tpl['DIRECTION'] = self::_("Direction");
        $this->tpl['DECK_REMAINING_CARDS'] = self::_("Remaining cards in deck");
		$this->tpl['player_before_name'] = $player_before['player_name'];
		$this->tpl['player_before_color'] = $player_before['player_color'];
		$this->tpl['player_after_name'] = $player_after['player_name'];
		$this->tpl['player_after_color'] = $player_after['player_color'];

        /*********** Do not change anything below this line  ************/
  	}
  }
  

