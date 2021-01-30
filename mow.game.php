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
                "reverse_direction" => 10
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
        // The number of colors defined here must correspond to the maximum number of players allowed for the game
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
        self::setGameStateInitialValue( 'reverse_direction', 1 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat( 'table', 'collectedHerdsNumber', 0 );    // Init a table statistics
        self::initStat( 'table', 'keepDirectionNumber', 0 ); 
        self::initStat( 'table', 'changeDirectionNumber', 0 );
        self::initStat( 'player', 'nbrNoPointCards', 0 );  // Init a player statistics (for all players)
        self::initStat( 'player', 'nbrOnePointCards', 0 );
        self::initStat( 'player', 'nbrTwoPointsCards', 0 );
        self::initStat( 'player', 'nbrThreePointsCards', 0 );
        self::initStat( 'player', 'nbrFivePointsCards', 0 );

        // setup the initial game situation here
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
               
        //$this->cards->createCards( array_slice($cards, count($cards) - 15, 15), 'deck' );
        $this->cards->createCards( $cards, 'deck' );
	   

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
        $result['current_player_id'] = $current_player_id;
        $result['next_players_id'] = self::createNextPlayerTable(array_keys(self::loadPlayersBasicInfos()));
  
		// Cards in player hand      
        $result['hand'] = $this->cards->getCardsInLocation( 'hand', $current_player_id );
        
        // Cards played on the table
        $result['herd'] = $this->cards->getCardsInLocation( 'herd' );
        
        $sql = "SELECT card_id, card_slowpoke_type_arg FROM card WHERE card_type_arg=21 OR card_type_arg=22 and card_slowpoke_type_arg is not null";
        $slowpokes = self::getCollectionFromDb( $sql );
        foreach($slowpokes as $slowpoke) {
            foreach($result['herd'] as &$herdCard) {
                if (intval($herdCard['id']) == intval($slowpoke['card_id'])) {
                    $herdCard['slowpoke_type_arg'] = $slowpoke['card_slowpoke_type_arg'];
                }
            }
        }
        
        // Remaining cards on deck
        $result['remainingCards'] = count($this->cards->getCardsInLocation( 'deck' ));

        $result['allowedCardsIds'] = $this->getAllowedCardsIds($current_player_id);

        $result['reverse_direction'] = intval(self::getGameStateValue( 'reverse_direction' )) == 1;
  
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
        $sql = "SELECT min(player_score) FROM player ";
        $minscore = self::getUniqueValueFromDB( $sql );

        return -100 * $minscore / END_SCORE;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */

    
    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function getAllowedCardsIds($pId) {
        $hand = $this->cards->getCardsInLocation('hand', $pId);
        $herd = $this->cards->getCardsInLocation('herd');
        
        $allowedCardIds = [];
        foreach($hand as $card) {
            try {
                $this->controlCardPlayable($card);
                $allowedCardIds[] = intval($card['id']);
            } catch (Exception $e){}
        }
    
        return $allowedCardIds;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in mow.action.php)
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

        
        $cardNumber = intval($card['type_arg']);

        if (count($herdCards) > 0) {
            $minHerd = min($herdDisplayedNumbers);
            $maxHerd = max($herdDisplayedNumbers);
            
            // if it's not in the interval
            if (($card['type'] != '5' || $card['type_arg'] == '0' || $card['type_arg'] == '16') && $cardNumber >= $minHerd && $cardNumber <= $maxHerd) {
                if ($minHerd == $maxHerd) {
                    throw new BgaUserException(sprintf(self::_("You must play different than %s"), $minHerd), true);
                } else {
                    throw new BgaUserException(sprintf(self::_("You must play less than %s or more than %s"), $minHerd, $maxHerd), true);
                }
            }
        }

        // if acrobatic can't be played
        if (($cardNumber == 70 && !in_array(7, $herdDisplayedNumbers)) || ($cardNumber == 90 && !in_array(9, $herdDisplayedNumbers))) {
            $cardNumber = $cardNumber / 10;
            throw new BgaUserException(sprintf(self::_("You can't play acrobatic %s if there is no %s"), $cardNumber, $cardNumber), true);
        }

        // if no place for slowpoke
        if ($cardNumber == 21 || $cardNumber == 22) {
            $places = $this->getPlacesForSlowpoke();

            if (count($places) == 0) {
                throw new BgaUserException(self::_("You can't play slowpoke cow, no place available"), true);
            }
        }
    }    
    
    // Play a card from player hand
    function playCard($card_id) {
        self::checkAction("playCard");        
        $player_id = self::getActivePlayerId();
        $card = $this->cards->getCard( $card_id );

        $this->controlCardInHand($player_id, $card_id);
        $this->controlCardPlayable($card);

        $slowpokeNumber = -1;
        if ($card['type_arg'] == 21 || $card['type_arg'] == 22) {
            $places = $this->getPlacesForSlowpoke();
            
            //self::dump('$places', json_encode($places));

            $slowpokeNumber = intval($places[0][0]['type_arg']);
            $card['card_slowpoke_type_arg'] = $slowpokeNumber;             
            $sql = "UPDATE card SET card_slowpoke_type_arg=$slowpokeNumber WHERE card_id='$card_id'";
            self::DbQuery($sql);
        }
        
        // Checks are done! now we can play our card
        $this->cards->moveCard( $card_id, 'herd');
            
        $displayedNumber = intval($card['type_arg']);
        $precision = '';
        if ($displayedNumber == 21 || $displayedNumber == 22) {
            $displayedNumber = '';
            $precision = 'slowpoke';
        } else if ($displayedNumber == 70 || $displayedNumber == 90) {
            $displayedNumber /= 10;
            $precision = 'acrobatic';
        }

        // And notify
        self::notifyAllPlayers('cardPlayed', clienttranslate('${player_name} plays ${displayedNumber_rec}${precision}'), array(
            'card_id' => $card_id,
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'value' => $card['type_arg'],
            'displayedNumber' => $displayedNumber, // The substitution will be done in JS format_string_recursive function
            'displayedNumber_rec'=> ['log'=>'${displayedNumber}', 'args'=> ['displayedNumber'=>$displayedNumber, 'displayedColor'=>$card['type'] ]],
            'color' => $card['type'],
            'precision' => $precision, // The substitution will be done in JS format_string_recursive function,
            'remainingCards' => count($this->cards->getCardsInLocation( 'deck' )),
            'slowpokeNumber' => $slowpokeNumber
        ));

        // get new card if possible
        $newCard = $this->cards->pickCard('deck', $player_id );
        if ($newCard) {
            self::notifyPlayer( $player_id, 'newCard', '', array( 
                'card' => $newCard
            ) );
        }

        // TODO notify all players
        $players = self::loadPlayersBasicInfos();
        foreach( $players as $pId => $player )
        {
            $allowedCardsIds = $this->getAllowedCardsIds($pId);

            self::notifyPlayer( $pId, 'allowedCards', '', array( 
                'allowedCardsIds' => $allowedCardsIds
            ) );
        }
        
        // changing direction is useless with 2 players
        $canChooseDirection = $card['type'] === '5' && self::getPlayersNumber() > 2;
        // Next player
        $this->gamestate->nextState($canChooseDirection ? 'chooseDirection' : 'playCard');
    }

    function getPlacesForSlowpoke() {
        $places = [];
        $herd = $this->cards->getCardsInLocation('herd');
        $herdWithoutSlowpokes = array_values(array_filter($herd, function($card) { return $card['type_arg'] != 21 && $card['type_arg'] != 22; }));

        usort($herdWithoutSlowpokes, function ($a, $b) { return intval($a['type_arg']) - intval($b['type_arg']); });
        //self::dump('$sortedHerdWithoutSlowpokes', json_encode($herdWithoutSlowpokes));

        $lastDisplayedNumber = null;
        $lastCard = null;
        $herdHasSlowpoke = count(array_filter($herd, function($card) { return $card['type_arg'] == '21' || $card['type_arg'] == '22'; })) > 0;
        $herdSlowPokeAlreadyPlaced = false;
        for($i=0;$i<count(array_values($herdWithoutSlowpokes));$i++) {
            $card = $herdWithoutSlowpokes[$i];
            //self::dump('$card', json_encode($card));

            if ($lastDisplayedNumber != null) {
                $currentDisplayedNumber = intval($card['type_arg']);
                if ($currentDisplayedNumber == 70 || $currentDisplayedNumber == 90) {
                    $currentDisplayedNumber = $currentDisplayedNumber / 10;
                }

                $diff = $currentDisplayedNumber - $lastDisplayedNumber;
                if ($diff >= 2) {
                    $canPlace = true;
                    if ($diff == 2 && $herdHasSlowpoke && !$herdSlowPokeAlreadyPlaced) {
                        $canPlace = false;
                    }
                    $herdSlowPokeAlreadyPlaced = true;
                    if ($canPlace) {
                        $places[] = [$lastCard, $card];
                    }
                }

                $lastDisplayedNumber = $currentDisplayedNumber;
                $lastCard = $card;
            }            
            $lastDisplayedNumber = intval($card['type_arg']);
            $lastCard = $card;
            if ($lastDisplayedNumber == 70 || $lastDisplayedNumber == 90) {
                $lastDisplayedNumber = $lastDisplayedNumber / 10;
            }
        }

        //self::dump('$places', json_encode($places));
        return $places;
    }

    function setDirection($change) {

        if ($change) {
            $reverse_direction = intval(self::getGameStateValue( 'reverse_direction' )) == 1 ? 0 : 1;
            self::setGameStateValue('reverse_direction', $reverse_direction);

            self::notifyAllPlayers('directionChanged', clienttranslate('${player_name} changes direction !'), array(
                'player_name' => self::getActivePlayerName(),
                'reverse_direction' => $reverse_direction == 1
            ));

            self::incStat( 1, "changeDirectionNumber" );
        } else {
            self::incStat( 1, "keepDirectionNumber" );
        }

        $this->gamestate->nextState('setDirection');
    }

    function getCardsValues($cards) {
        return array_sum(array_map(function($card) { return intval($card['type']); }, $cards));
    }

    function collectedCardsStats($cards, $player_id) {
        foreach( $cards as $card ) {
            switch (intval($card['type'])) {
                case 0:
                    self::incStat( 1, "nbrNoPointCards", $player_id );
                    break;
                case 1:
                    self::incStat( 1, "nbrOnePointCards", $player_id );
                    break;
                case 2:
                    self::incStat( 1, "nbrTwoPointsCards", $player_id );
                    break;
                case 3:
                    self::incStat( 1, "nbrThreePointsCards", $player_id );
                    break;
                case 5:
                    self::incStat( 1, "nbrFivePointsCards", $player_id );
                    break;
            }
        }
        
        
    }

    function collectHerd() {
        // collected cards go to the side
        
        $player_id = self::getActivePlayerId();

        $herdCards = $this->cards->getCardsInLocation( "herd" );
        $collectedPoints = $this->getCardsValues($herdCards);
        $this->collectedCardsStats($herdCards, $player_id);

        $sql = "UPDATE player SET player_score=player_score-$collectedPoints, hand_points=hand_points-$collectedPoints WHERE player_id='$player_id'";
        self::DbQuery($sql);

        $this->cards->moveAllCardsInLocation( "herd", "discard" );
        $sql = "UPDATE card SET card_slowpoke_type_arg=null WHERE card_slowpoke_type_arg is not null";
        self::DbQuery($sql);

        self::incStat( 1, "collectedHerdsNumber" );
            
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
                $this->collectedCardsStats($player_hand, $player_id);

                if ($cardsValue > 0) {
                    $sql = "UPDATE player SET player_score=player_score-$cardsValue, hand_points=hand_points-$cardsValue WHERE player_id='$player_id'";
                    self::DbQuery($sql);
                        
                    // And notify
                    self::notifyAllPlayers('handCollected', clienttranslate('${player_name} collects points in his hand'), array(
                        'player_id' => $player_id,
                        'player_name' => $player['player_name'],
                        'points' => $cardsValue
                    ));
                }
            }

            // TODO

            $this->gamestate->nextState('collectLastHerd');
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

    function argPlayerTurn() {
        $herd = $this->cards->getCardsInLocation('herd');

        return [
            'canCollect' => count($herd) > 0
        ];
    }

    function argChooseDirection() {
        return [
            'reverse_direction' => intval(self::getGameStateValue( 'reverse_direction' )) == 1
        ];  
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
	
    function stNewHand()
    {
        // Take back all cards (from any location => null) to deck
        $this->cards->moveAllCardsInLocation( null, "deck" );
        $this->cards->shuffle( 'deck' );
    
	    self::DbQuery("UPDATE player SET hand_points = 0 WHERE 1");
        //self::notifyAllPlayers('cleanUp');

        $players = self::loadPlayersBasicInfos();
        $remainingCards = count($this->cards->getCardsInLocation( 'deck' )) - (5 * count($players));

        // Deal 5 cards to each players
        // Create deck, shuffle it and give 5 initial cards
        foreach( $players as $player_id => $player )
        {
            $cards = $this->cards->pickCards( 5, 'deck', $player_id );
            
            // Notify player about his cards
            self::notifyPlayer( $player_id, 'newHand', '', array( 
                'cards' => $cards,
                'remainingCards' => $remainingCards
            ) );
        }

        $this->gamestate->nextState( "" );
    }
    
    
function stNextPlayer()
{
	$players = self::loadPlayersBasicInfos();
	$nbr_players = self::getPlayersNumber();

    if (intval(self::getGameStateValue( 'reverse_direction' )) == 1) {
        $player_id = self::activePrevPlayer();
    } else {
        $player_id = self::activeNextPlayer();
    }
	self::giveExtraTime($player_id);
	$this->gamestate->nextState( 'nextPlayer' );
}

function stEndHand()
{
	$players = self::getObjectListFromDB("SELECT * FROM player");
	/*foreach($players as $player){
		$score = $player['hand_points'];
		$msg = $score == 0? clienttranslate( '${player_name} did not get any point' ) : clienttranslate( '${player_name} wins ${points} points' );
		self::notifyAllPlayers( "points", $msg, [
			'player_id' => $player['player_id'],
			'player_name' => $player['player_name'],
			'points' => $score
		]);
	}*/

	/// Display table window with results ////

	// Header line
	$headers = [''];
	$handPoints = [ ['str' => clienttranslate('Hand points'), 'args' => [] ] ];
	$totalPoints = [ ['str' => clienttranslate('Total points'), 'args' => [] ] ];
	foreach($players as $player){
		$headers[] = [
				'str' => '${player_name}',
				'args' => ['player_name' => $player['player_name']],
				'type' => 'header'
    ];
		$handPoints[] = $player['hand_points'];
		$totalPoints[] = $player['player_score'];
	}
	$table = [$headers, $handPoints, $totalPoints];

    // Test if this is the end of the game
    $sql = "SELECT min(player_score) FROM player ";
    $minscore = self::getUniqueValueFromDB( $sql );
    $end = intval($minscore) <= -END_SCORE;

	$this->notifyAllPlayers( "tableWindow", '', array(
		"id" => 'finalScoring',
		"title" => clienttranslate('Result of hand'),
		"table" => $table,
		"closing" => $end ? clienttranslate("End of game") : clienttranslate("Next hand")
    ));
    
    $sql = "SELECT player_id  FROM player where player_score=(select min(player_score) from player) limit 1";
    $minscore_player_id = self::getUniqueValueFromDB( $sql );

    $this->gamestate->changeActivePlayer( $minscore_player_id );

	$this->gamestate->nextState($end ? "endGame" : "nextHand");
}

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
        $this->gamestate->nextState("playCard");
    }
}
