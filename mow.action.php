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
  	
  	// TODO: defines your action entry points there
	
    public function playCard()
    {
        self::setAjaxMode();     
        $card_id = self::getArg( "card_id", AT_posint, true );
        $this->game->playCard( $card_id );
        self::ajaxResponse( );
    }
	
    public function chooseDirection()
    {
        self::setAjaxMode();     
        $change = self::getArg( "change", AT_bool, true );
        $this->game->chooseDirection( $change );
        self::ajaxResponse( );
    }
    
    public function collectHerd()
    {
        self::setAjaxMode();     
        /*$cards_raw = self::getArg( "cards", AT_numberlist, true );
        
        // Removing last ';' if exists
        if( substr( $cards_raw, -1 ) == ';' ) {
            $cards_raw = substr( $cards_raw, 0, -1 );
        }
        if( $cards_raw == '' ) {
            $cards = array();
        } else {
            $cards = explode( ';', $cards_raw );
        }

        $this->game->collectHerd( $cards );*/
        $this->game->collectHerd();
        self::ajaxResponse( );    
    }

	
	
    /*
    
    Example:
  	
	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */

  }
  

