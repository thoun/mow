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
 * states.inc.php
 *
 * mow game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

require_once("modules/constants.inc.php");

//    !! It is not a good idea to modify this file when a game is running !!

$machinestates = array(

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => array(
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => ST_NEW_HAND )
    ),
    	
	ST_NEW_HAND => array(
        "name" => "newHand",
        "description" => "",
        "type" => "game",
        "action" => "stNewHand",
        "updateGameProgression" => true,   
        "transitions" => array( "" => ST_PLAYER_TURN )
    ),  

    ST_PLAYER_TURN => array(
    	"name" => "playerTurn",
    	"description" => clienttranslate('${actplayer} must play a card or pick up the herd'),
    	"descriptionmyturn" => clienttranslate('${you} must play a card or pick up the herd'),
    	"type" => "activeplayer",
        "args" => "argPlayerTurn",
    	"possibleactions" => array( "playCard", "chooseDirection", "collectHerd", "collectLastHerd", "endGame" ),
    	"transitions" => array( 
            "playCard" => ST_NEXT_PLAYER, 
            "chooseDirection" => ST_CHOOSE_DIRECTION, 
            "collectHerd" => ST_PLAYER_TURN, 
            "collectLastHerd" => ST_COLLECT_HAND
        )
    ),

    ST_CHOOSE_DIRECTION => array(
    	"name" => "chooseDirection",
    	"description" => clienttranslate('${actplayer} must choose the direction'),
    	"descriptionmyturn" => clienttranslate('${you} must choose the direction'),
    	"type" => "activeplayer",
        "args" => "argChooseDirection",
    	"possibleactions" => array( "setDirection" ),
    	"transitions" => array( "setDirection" => ST_NEXT_PLAYER )
    ),

    /*ST_COLLECT_HERD => array(
        "name" => "newHand",
        "description" => "",
        "type" => "game",
        "action" => "stNewHand",
        "updateGameProgression" => true,   
        "transitions" => array( "" => ST_PLAYER_TURN )
    ),  */
	
	ST_NEXT_PLAYER => array(
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => array( "nextPlayer" => ST_PLAYER_TURN/*, "endGame" => ST_END_HAND*/ )
    ), 


    ST_COLLECT_HAND => [
        "name" => "collectHand",
        "description" => clienttranslate("Collect points in each player's hand"),
        "type" => "game",
        "action" => "stCollectHand",
        "transitions" => [
          "endHand" => ST_END_HAND
        ]
      ],

    // End of the hand (scoring, etc...)
    ST_END_HAND => array(
      "name" => "endHand",
      "description" => "",
      "type" => "game",
      "action" => "stEndHand",
      "transitions" => array( "nextHand" => ST_NEW_HAND, "endGame" => ST_END_GAME )
    ),

   
    // Final state.
    // Please do not modify.
    ST_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);


