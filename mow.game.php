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
  * mow.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once("modules/constants.inc.php");


class mow extends Table
{
	function __construct( )
	{
        	
 
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();self::initGameStateLabels( array( 
                "reverse_direction" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ) );
		
        $this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "card" );
	}
	
    protected function getGameName( )
    {
        return "mow";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        $sql = "DELETE FROM player WHERE 1 ";
        self::DbQuery( $sql ); 

        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $default_colors = array( "ff0000", "008000", "0000ff", "ffa500", "773300" );

 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'reverse_direction', false );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
       
	   
	    // Create the cards:	   
	    $cards = array();
		
		for( $value=1; $value<=15; $value++ )   // 1-15 green
        {
			$cards[] = array( 'type' => 0, 'type_arg' => $value, 'nbr' => 1, 'id' => $value);
		}
		
		for( $value=2; $value<=14; $value++ )   // 2-14 yellow
        {
			$cards[] = array( 'type' => 1, 'type_arg' => $value, 'nbr' => 1, 'id' => 100 + $value);
		}
		
		for( $value=3; $value<=13; $value++ )   // 3-13 orange
        {
			$cards[] = array( 'type' => 2, 'type_arg' => $value, 'nbr' => 1, 'id' => 200 + $value);
		}
		
		for( $value=7; $value<=9; $value++ )   // 7,8,9 red
        {
			$cards[] = array( 'type' => 3, 'type_arg' => $value, 'nbr' => 1, 'id' => 300 + $value);
		}
		
		// The six special cows
		foreach($this->special_labels as $key => $value)
		{
			$cards[] = array( 'type' => 5, 'type_arg' => $value, 'nbr' => 1, 'id' => 500 + $value);
        }
			   
        $this->cards->createCards( array_slice($cards, count($cards) - 15, 15), 'deck' );   // TODO Add special cards
	   

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array( 'players' => array() );
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
  
		// Cards in player hand      
        $result['hand'] = $this->cards->getCardsInLocation( 'hand', $current_player_id );
        
        // Cards played on the table
        $result['herd'] = $this->cards->getCardsInLocation( 'herd' );

        
        $result['remainingCards'] = count($this->cards->getCardsInLocation( 'deck' ));
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in mow.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} played ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */
    function controlCardInHand($player_id, $card_id) {
        // Get all cards in player hand        
        $player_hand = $this->cards->getCardsInLocation('hand', $player_id);

        // Check that the card is in this hand
        $bIsInHand = false;
        foreach($player_hand as $current_card) {
            if($current_card['id'] == $card_id) {
                $bIsInHand = true;
            }
        }

        if(!$bIsInHand) {
            throw new BgaUserException(self::_("This card is not in your hand"));
        }
    }

    function controlCardPlayable($card) {        

        $herdCards = $this->cards->getCardsInLocation('herd');

        if (count($herdCards) == 0) {
            return;
        }

        //self::dump('herdCards', json_encode($herdCards));
        $herdDisplayedNumbers = array_filter(
            array_map(function($current_card) {
                if ($current_card['type'] != '5' || $current_card['type_arg'] == '0' || $current_card['type_arg'] == '16') {
                    return intval($current_card['type_arg']);
                } else {
                    return -1;
                }
            }, $herdCards), 
            function($k) {
                return $k != -1;
            });

        $minHerd = min($herdDisplayedNumbers);
        $maxHerd = max($herdDisplayedNumbers);
        
        // if it's not in the interval
        $cardNumber = intval($card['type_arg']);
        if (($card['type'] != '5' || $card['type_arg'] == '0' || $card['type_arg'] == '16') && $cardNumber >= $minHerd && $cardNumber <= $maxHerd) {
            if ($minHerd == $maxHerd) {
                throw new BgaUserException(sprintf(self::_("You must play different than %s"), $minHerd), true);
            } else {
                throw new BgaUserException(sprintf(self::_("You must play less than %s or more than %s"), $minHerd, $maxHerd), true);
            }
        }
        // if acrobatic can't be played
        if (($cardNumber == 70 && !in_array(7, $herdDisplayedNumbers)) || ($cardNumber == 90 && !in_array(9, $herdDisplayedNumbers))) {
            $cardNumber = $cardNumber / 10;
            throw new BgaUserException(sprintf(self::_("You can't play acrobatic %s if there is no %s"), $cardNumber, $cardNumber), true);
        }
    }    
    
    // Play a card from player hand
    function playCard($card_id) {
        self::checkAction("playCard");        
        $player_id = self::getActivePlayerId();
        $card = $this->cards->getCard( $card_id );

        $this->controlCardInHand($player_id, $card_id);
        $this->controlCardPlayable($card);
        
        // Checks are done! now we can play our card
        $this->cards->moveCard( $card_id, 'herd');
            
        // And notify
        self::notifyAllPlayers('cardPlayed', clienttranslate('${player_name} plays ${value_symbol}${color_symbol}'), array(
            'card_id' => $card_id,
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'value' => $card['type_arg'],
            'value_symbol' => $card['type_arg'], // The substitution will be done in JS format_string_recursive function
            'color' => $card['type'],
            'color_symbol' => $card['type'], // The substitution will be done in JS format_string_recursive function,
            'remainingCards' => count($this->cards->getCardsInLocation( 'deck' ))
        ));

        // get new card if possible
        $newCard = $this->cards->pickCard('deck', $player_id );
        if ($newCard) {
            self::notifyPlayer( $player_id, 'newCard', '', array( 
                'card' => $newCard
            ) );
        }
        
        // changing direction is useless with 2 players
        $canChooseDirection = $card['type'] === '5' && self::getPlayersNumber() > 2
        // Next player
        $this->gamestate->nextState($canChooseDirection ? 'chooseDirection' : 'playCard');
    }

    function setDirection($change) {

        if ($change) {
            self::setGameStateValue('reverse_direction', !self::getGameStateValue( 'reverse_direction' ) );
        }

        // TODO
        $this->gamestate->nextState('setDirection');
    }

    function getCardsValues($cards) {
        return array_sum(array_map(function($card) { return intval($card['type']); }, $cards));
    }

    function collectHerd() {
        // collected cards go to the side
        
        $player_id = self::getActivePlayerId();

        $herdCards = $this->cards->getCardsInLocation( "herd" );
        $collectedPoints = $this->getCardsValues($herdCards);

        $sql = "UPDATE player SET player_score=player_score-$collectedPoints WHERE player_id='$player_id'";
        self::DbQuery($sql);

        $this->cards->moveAllCardsInLocation( "herd", "used" );
            
        // And notify
        self::notifyAllPlayers('herdCollected', clienttranslate('${player_name} collects herd'), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'points' => $collectedPoints
        ));

        if (count($this->cards->getCardsInLocation( "deck" )) > 0) {
            $this->gamestate->nextState('collectHerd');
        } else {
            $players = self::loadPlayersBasicInfos();
            foreach( $players as $player_id => $player )
            {
                $player_hand = $this->cards->getCardsInLocation('hand', $player_id);
                $cardsValue = $this->getCardsValues($player_hand);

                if ($cardsValue > 0) {
                    $sql = "UPDATE player SET player_score=player_score-$cardsValue WHERE player_id='$player_id'";
                    self::DbQuery($sql);
                        
                    // And notify
                    self::notifyAllPlayers('handCollected', clienttranslate('${player_name} collects points in his hand'), array(
                        'player_id' => $player_id,
                        'player_name' => $player['player_name'],
                        'points' => $cardsValue
                    ));
                }
            }


            $sql = "SELECT min(player_score) FROM player ";
            $minscore = self::getUniqueValueFromDB( $sql );

            $this->gamestate->nextState(intval($minscore) <= -END_SCORE ? 'endGame' : 'collectLastHerd');
        }
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
	
    function stNewHand()
    {
      //  self::incStat( 1, "handNbr" );
    
        // Take back all cards (from any location => null) to deck
        $this->cards->moveAllCardsInLocation( null, "deck" );
        $this->cards->shuffle( 'deck' );
    
        //self::notifyAllPlayers('cleanUp');

        // Deal 5 cards to each players
        // Create deck, shuffle it and give 5 initial cards
        $players = self::loadPlayersBasicInfos();
        foreach( $players as $player_id => $player )
        {
            $cards = $this->cards->pickCards( 5, 'deck', $player_id );
            
            // Notify player about his cards
            self::notifyPlayer( $player_id, 'newHand', '', array( 
                'cards' => $cards
            ) );
        }        
        
       // self::setGameStateValue( 'alreadyPlayedHearts', 0 );

        $this->gamestate->nextState( "" );
    }
    
    
function stNextPlayer()
{
	$players = self::loadPlayersBasicInfos();
	$nbr_players = self::getPlayersNumber();

    // Standard case (not the end of the trick) => just active the next player
    if (self::getGameStateValue( 'reverse_direction' )) {
        $player_id = self::activePrevPlayer();
    } else {
        $player_id = self::activeNextPlayer();
    }
	self::giveExtraTime($player_id);
	$this->gamestate->nextState( 'nextPlayer' );
}


    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
    */

    function zombieTurn( $state, $active_player )
    {   
        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
}
