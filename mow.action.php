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
 * mow.action.php
 *
 * mow main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/mow/mow/myAction.html", ...)
 *
 */
  
  
  class action_mow extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "mow_mow";
            self::trace( "Complete reinitialization of board game" );
      }
  	}
	
    public function playCard() {
        self::setAjaxMode();     
        $cardId = self::getArg( "id", AT_posint, true );
        $this->game->playCard( $cardId );
        self::ajaxResponse();
    }
	
    public function playFarmer() {
        self::setAjaxMode();     
        $cardId = self::getArg( "id", AT_posint, true );
        $this->game->playFarmer( $cardId );
        self::ajaxResponse();
    }
	
    public function setDirection() {
        self::setAjaxMode();     
        $change = self::getArg( "change", AT_bool, true );
        $this->game->setDirection($change);
        self::ajaxResponse();
    }
	
    public function setPlayer() {
        self::setAjaxMode();     
        $playerId = self::getArg( "id", AT_posint, true );
        $this->game->setPlayer($playerId);
        self::ajaxResponse();
    }
    
    public function pass() {
        self::setAjaxMode();
        $this->game->passFarmer();
        self::ajaxResponse();    
    }
    
    public function collectHerd() {
        self::setAjaxMode();
        $this->game->collectHerd();
        self::ajaxResponse();    
    } 
	
    public function viewCards() {
        self::setAjaxMode();     
        $playerId = self::getArg( "playerId", AT_posint, true );
        $this->game->viewCards($playerId);
        self::ajaxResponse();
    }
	
    public function exchangeCard() {
        self::setAjaxMode();     
        $playerId = self::getArg( "playerId", AT_posint, true );
        $this->game->exchangeCard($playerId);
        self::ajaxResponse();
    } 
    
    public function ignoreFlies() {
        self::setAjaxMode();
        $playerId = self::getArg("playerId", AT_posint, true); // 0 means "don't use card"
        $type = self::getArg("type", AT_posint, true);
        $this->game->ignoreFlies($playerId, $type);
        self::ajaxResponse();    
    }
	
    public function swap() {
        self::setAjaxMode();     
        $playerId = self::getArg( "playerId", AT_posint, true ); // 0 means "don't swap"
        $this->game->swap($playerId);
        self::ajaxResponse();
    }

  }
  

