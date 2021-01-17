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
	
    public function playCard()
    {
        self::setAjaxMode();     
        $card_id = self::getArg( "card_id", AT_posint, true );
        $this->game->playCard( $card_id );
        self::ajaxResponse( );
    }
	
    public function setDirection()
    {
        self::setAjaxMode();     
        $change = self::getArg( "change", AT_bool, true );
        $this->game->setDirection( $change );
        self::ajaxResponse( );
    }
    
    public function collectHerd()
    {
        self::setAjaxMode();
        $this->game->collectHerd();
        self::ajaxResponse( );    
    }

  }
  

