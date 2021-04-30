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
require_once("modules/card.php");
require_once("modules/farmer-card.php");

class mow extends Table {
	function __construct() {
        	
 
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        self::initGameStateLabels([ 
                "direction_clockwise" => 10,
                "swapping_player" => 11,
                "canPick" => 12,
                "gotoPlayer" => 13,
                'cowPlayed' => 14,

                // farmer cards constants
                'cantPlaySpecial' => 50,
                'chooseDirectionPick' => 51,
                'lookOpponentHand' => 52,
                'exchangeCard' => 53,

                // game options
                "simpleVersion" => 100,
        ]);
		
        $this->cards = self::getNew("module.common.deck");
        $this->cards->init("cow");
		
        $this->farmerCards = self::getNew("module.common.deck");
        $this->farmerCards->init("farmer");
	}
	
    protected function getGameName() {
        return "mow";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = [] ) {    
        $sql = "DELETE FROM player WHERE 1 ";
        self::DbQuery( $sql ); 

        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the game
        $default_colors = ["ff0000", "008000", "0000ff", "ffa500", "773300"];

 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
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
        self::setGameStateInitialValue( 'direction_clockwise', 1 );
        self::setGameStateInitialValue( 'swapping_player', 0 );
        self::setGameStateInitialValue( 'canPick', 0 );
        self::setGameStateInitialValue( 'gotoPlayer', 0 );
        self::setGameStateInitialValue( 'cowPlayed', 0 );
        self::setGameStateInitialValue( 'cantPlaySpecial', 0 );
        self::setGameStateInitialValue( 'chooseDirectionPick', 0 );
        self::setGameStateInitialValue( 'lookOpponentHand', 0 );
        self::setGameStateInitialValue( 'exchangeCard', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat( 'table', 'collectedHerdsNumber', 0 );    // Init a table statistics
        self::initStat( 'table', 'keepDirectionNumber', 0 ); 
        self::initStat( 'table', 'changeDirectionNumber', 0 );
        self::initStat( 'table', 'collectedPoints', 0 ); 
        self::initStat( 'table', 'remainingPoints', 0 );
        self::initStat( 'player', 'collectedPoints', 0 );  // Init a player statistics (for all players)
        self::initStat( 'player', 'remainingPoints', 0 ); 
        self::initStat( 'player', 'nbrNoPointCards', 0 );
        self::initStat( 'player', 'nbrOnePointCards', 0 );
        self::initStat( 'player', 'nbrTwoPointsCards', 0 );
        self::initStat( 'player', 'nbrThreePointsCards', 0 );
        self::initStat( 'player', 'nbrFivePointsCards', 0 );

        // setup the initial game situation here
	    // Create the cards:	   
	    $cards = [];
		
		for( $value=1; $value<=15; $value++ ) { // 1-15 green
			$cards[] = ['type' => 0, 'type_arg' => $value, 'nbr' => 1, 'id' => $value];
		}
		
		for( $value=2; $value<=14; $value++ ) { // 2-14 yellow
			$cards[] = ['type' => 1, 'type_arg' => $value, 'nbr' => 1, 'id' => 100 + $value];
		}
		
		for( $value=3; $value<=13; $value++ ) { // 3-13 orange
			$cards[] = ['type' => 2, 'type_arg' => $value, 'nbr' => 1, 'id' => 200 + $value];
		}
		
		for( $value=7; $value<=9; $value++ ) { // 7,8,9 red
			$cards[] = ['type' => 3, 'type_arg' => $value, 'nbr' => 1, 'id' => 300 + $value];
		}		
		
		foreach($this->special_labels as $key => $value) { // The six special cows
			$cards[] = ['type' => 5, 'type_arg' => $value, 'nbr' => 1, 'id' => 500 + $value];
        }
               
        $this->cards->createCards( array_slice($cards, count($cards) - 10, 10), 'deck' );
        //$this->cards->createCards($cards, 'deck');

        
        $farmerCards = [];
        for( $value=1; $value<=10; $value++ ) { // 7,8,9 red
			$farmerCards[] = ['type' => $value, 'type_arg' => $this->farmers_placement[$value], 'nbr' => 1];
		}
        $this->farmerCards->createCards($farmerCards, 'deck');

        // TODO TEMP
        foreach( $players as $player_id => $player ){ $this->farmerCards->pickCards(2, 'deck', $player_id); }	   

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
    protected function getAllDatas() {
        $result = [
            'players' => []
        ];
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
        $result['current_player_id'] = $current_player_id;
        $result['next_players_id'] = self::createNextPlayerTable(array_keys(self::loadPlayersBasicInfos()));
        $result['simpleVersion'] = $this->isSimpleVersion();
  
		// Cards in player hand      
        $result['hand'] = $this->getCardsFromDb($this->cards->getCardsInLocation( 'hand', $current_player_id ));
        $result['farmerHand'] = $this->getFarmerCardsFromDb($this->farmerCards->getCardsInLocation( 'hand', $current_player_id ));
        
        // Cards played on the table
        $result['herd'] = $this->getCardsFromDb($this->cards->getCardsInLocation( 'herd' ));
        
        $sql = "SELECT card_id id, card_slowpoke_type_arg slowpoke_type_arg FROM cow WHERE card_type_arg=21 OR card_type_arg=22 and card_slowpoke_type_arg is not null";
        $slowpokes = array_map(function($db) { 
            $slowpoke = new stdClass();
            $slowpoke->id = intval($db['id']);
            $slowpoke->slowpokeNumber = intval($db['slowpoke_type_arg']);
            return $slowpoke;
        }, array_values(self::getCollectionFromDb($sql)));
        foreach($slowpokes as $slowpoke) {
            foreach($result['herd'] as &$herdCard) {
                if ($herdCard->id == $slowpoke->id) {
                    $herdCard->slowpokeNumber = $slowpoke->slowpokeNumber;
                }
            }
        }
        
        // Remaining cards on deck
        $result['remainingCards'] = count($this->cards->getCardsInLocation( 'deck' ));

        $result['allowedCardsIds'] = $this->getAllowedCardsIds($current_player_id);

        $result['direction_clockwise'] = intval(self::getGameStateValue( 'direction_clockwise' )) == 1;
  
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
    function getGameProgression() {
        $sql = "SELECT min(player_score) FROM player ";
        $minscore = self::getUniqueValueFromDB( $sql );

        return -100 * $minscore / END_SCORE;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function isSimpleVersion() {
        return intval(self::getGameStateValue('simpleVersion')) === 2;
    }

    function getCardFromDb(array $dbCard) {
        if (!$dbCard || !array_key_exists('id', $dbCard)) {
            throw new Error('card doesn\'t exists '.json_encode($dbCard));
        }
        if (!$dbCard || !array_key_exists('location', $dbCard)) {
            throw new Error('location doesn\'t exists '.json_encode($dbCard));
        }
        return new Card($dbCard);
    }

    function getCardsFromDb(array $dbCards) {
        return array_map(function($dbCard) { return $this->getCardFromDb($dbCard); }, array_values($dbCards));
    }

    function getFarmerCardFromDb(array $dbCard) {
        if (!$dbCard || !array_key_exists('id', $dbCard)) {
            throw new Error('farmer card doesn\'t exists '.json_encode($dbCard));
        }
        if (!$dbCard || !array_key_exists('location', $dbCard)) {
            throw new Error('farmer location doesn\'t exists '.json_encode($dbCard));
        }
        return new FarmerCard($dbCard);
    }

    function getFarmerCardsFromDb(array $dbCards) {
        return array_map(function($dbCard) { return $this->getFarmerCardFromDb($dbCard); }, array_values($dbCards));
    }

    function getAllowedCardsIds(int $pId) {
        $hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $pId));
        
        $allowedCardIds = [];
        foreach($hand as $card) {
            try {
                $this->controlCardPlayable($card);
                $allowedCardIds[] = $card->id;
            } catch (Exception $e) {}
        }
    
        return $allowedCardIds;
    }

    function controlCardInHand(int $player_id, int $card_id) {
        // Get all cards in player hand        
        $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $player_id));

        // Check that the card is in this hand
        $bIsInHand = false;
        foreach($player_hand as $current_card) {
            if($current_card->id == $card_id) {
                $bIsInHand = true;
            }
        }

        if(!$bIsInHand) {
            throw new BgaUserException("This card is not in your hand");
        }
    }

    function controlCardPlayable(object $card) {
        if ($card->type == 5 && intval(self::getGameStateValue('cantPlaySpecial')) > 0) {
            throw new BgaUserException(self::_("You can't play a special cow because of a farmer card"), true);
        }

        $herdCards = $this->getCardsFromDb($this->cards->getCardsInLocation('herd'));

        //self::dump('herdCards', json_encode($herdCards));
        $herdDisplayedNumbers = array_filter(
            array_map(function($current_card) {
                if ($current_card->type != 5 || $current_card->number == 0 || $current_card->number == 16) {
                    return $current_card->number;
                } else {
                    return -1;
                }
            }, $herdCards), 
            function($k) {
                return $k != -1;
            });

        
        $cardNumber = $card->number;

        if (count($herdCards) > 0) {
            $minHerd = min($herdDisplayedNumbers);
            $maxHerd = max($herdDisplayedNumbers);
            
            // if it's not in the interval
            if (($card->type != 5 || $card->number == 0 || $card->number == 16) && $cardNumber >= $minHerd && $cardNumber <= $maxHerd) {
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

    function controlFarmerCardInHand(int $player_id, int $card_id) {
        // Get all cards in player hand        
        $player_hand = $this->getFarmerCardsFromDb($this->farmerCards->getCardsInLocation('hand', $player_id));

        // Check that the card is in this hand
        $bIsInHand = false;
        foreach($player_hand as $current_card) {
            if($current_card->id == $card_id) {
                $bIsInHand = true;
            }
        }

        if(!$bIsInHand) {
            throw new BgaUserException("This card is not in your hand");
        }
    }

    function controlFarmerCardPlayable(object $card, int $playerId, bool $endHand = false) {
        $validTime;
        if ($card->time == 9) {
            $validTime = $endHand;
        } else if ($card->time == 2) {
            $validTime = true;
        } else { 
            $alreadyPlayed = intval(self::getGameStateValue('cowPlayed')) > 0;
            if ($card->time == 1) {
                $validTime = !$alreadyPlayed;
            } else if ($card->time == 3) {
                $validTime = $alreadyPlayed;
            }
        }

        if (!$validTime) {
            throw new BgaUserException(self::_("You can't play this farmer card at this moment"), true);
        }

        if ($card->type == 7) {
            $player_hand = $this->getcardsFromDb($this->cards->getCardsInLocation('hand', $playerId));
            $centerCardsNumber = count(array_values(array_filter($player_hand, function($card) { return $card->number >= 7 && $card->number <= 9; })));

            if (count($this->cards->getCardsInLocation( 'deck' )) < $centerCardsNumber) {
                throw new BgaUserException(self::_("Not enough remaining cards to play this farmer card"), true);
            }
        }

        return true;
    }

    function getPlacesForSlowpoke() {
        $places = [];
        $herd = $this->getCardsFromDb($this->cards->getCardsInLocation('herd'));
        $herdWithoutSlowpokes = array_values(array_filter($herd, function($card) { return $card->number != 21 && $card->number != 22; }));

        usort($herdWithoutSlowpokes, function ($a, $b) { return $a->number - $b->number; });
        //self::dump('$sortedHerdWithoutSlowpokes', json_encode($herdWithoutSlowpokes));

        $lastDisplayedNumber = null;
        $lastCard = null;
        $herdHasSlowpoke = count(array_filter($herd, function($card) { return $card->number == 21 || $card->number == 22; })) > 0;
        $herdSlowPokeAlreadyPlaced = false;
        for($i=0;$i<count(array_values($herdWithoutSlowpokes));$i++) {
            $card = $herdWithoutSlowpokes[$i];
            //self::dump('$card', json_encode($card));

            if ($lastDisplayedNumber != null) {
                $currentDisplayedNumber = $card->number;
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
            $lastDisplayedNumber = $card->number;
            $lastCard = $card;
            if ($lastDisplayedNumber == 70 || $lastDisplayedNumber == 90) {
                $lastDisplayedNumber = $lastDisplayedNumber / 10;
            }
        }

        //self::dump('$places', json_encode($places));
        return $places;
    } 

    function getCardsValues($cards) {
        return array_sum(array_map(function($card) { return $card->type; }, $cards));
    }

    function collectedCardsStats(array $cards, int $player_id) {
        foreach( $cards as $card ) {
            switch ($card->type) {
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


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in mow.action.php)
    */
    
    // Play a card from player hand
    function playCard(int $card_id) {
        self::checkAction("playCard");  
              
        $player_id = self::getActivePlayerId();
        $this->controlCardInHand($player_id, $card_id);

        $card = $this->getCardFromDb($this->cards->getCard($card_id));
        $this->controlCardPlayable($card);

        $slowpokeNumber = -1;
        if ($card->number == 21 || $card->number == 22) {
            $places = $this->getPlacesForSlowpoke();
            
            //self::dump('$places', json_encode($places));

            $slowpokeNumber = intval($places[0][0]->number);
            $card->slowpokeNumber = $slowpokeNumber;             
            $sql = "UPDATE cow SET card_slowpoke_type_arg=$slowpokeNumber WHERE card_id='$card_id'";
            self::DbQuery($sql);
        }
        
        // Checks are done! now we can play our card
        $this->cards->moveCard( $card_id, 'herd');

        self::setGameStateValue('cowPlayed', 1);
        self::setGameStateValue('cantPlaySpecial', 0);
            
        $displayedNumber = $card->number;
        $precision = '';
        if ($displayedNumber == 21 || $displayedNumber == 22) {
            $displayedNumber = '';
            $precision = 'slowpoke';
        } else if ($displayedNumber == 70 || $displayedNumber == 90) {
            $displayedNumber /= 10;
            $precision = 'acrobatic';
        }

        // And notify
        self::notifyAllPlayers('cardPlayed', clienttranslate('${player_name} plays ${displayedNumber_rec}${precision}'), [
            'card_id' => intval($card_id),
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'number' => $card->number,
            'displayedNumber' => $displayedNumber, // The substitution will be done in JS format_string_recursive function
            'displayedNumber_rec'=> ['log'=>'${displayedNumber}', 'args'=> ['displayedNumber'=>$displayedNumber, 'displayedColor'=>$card->type ]],
            'color' => $card->type,
            'precision' => $precision, // The substitution will be done in JS format_string_recursive function,
            'remainingCards' => count($this->cards->getCardsInLocation( 'deck' )),
            'slowpokeNumber' => $slowpokeNumber,
        ]);

        // get new card if possible
        $dbCard = $this->cards->pickCard('deck', $player_id);
        if ($dbCard) {
            $newCard = $this->getCardFromDb($dbCard);
            self::notifyPlayer( $player_id, 'newCard', '', [
                'card' => $newCard
            ]);
        }

        // notify all players
        $players = self::loadPlayersBasicInfos();
        foreach ($players as $pId => $player) {
            $allowedCardsIds = $this->getAllowedCardsIds($pId);

            self::notifyPlayer( $pId, 'allowedCards', '', [
                'allowedCardsIds' => $allowedCardsIds
            ]);
        }
        
        // changing direction is useless with 2 players
        $canChooseDirection = $card->type === 5 && self::getPlayersNumber() > 2;
        if ($canChooseDirection) {
            self::setGameStateValue('canPick', ($displayedNumber == 0 || $displayedNumber == 16) ? 1 : 0);
        }
        // Next player
        $this->gamestate->nextState($canChooseDirection ? 'chooseDirection' : 'playCard');
    }

    function setDirection(bool $change) {

        if ($change) {
            $direction_clockwise = intval(self::getGameStateValue( 'direction_clockwise' )) == 1 ? 0 : 1;
            self::setGameStateValue('direction_clockwise', $direction_clockwise);

            self::notifyAllPlayers('directionChanged', clienttranslate('${player_name} changes direction !'), [
                'player_name' => self::getActivePlayerName(),
                'direction_clockwise' => $direction_clockwise == 1
            ]);

            self::incStat( 1, "changeDirectionNumber" );
        } else {
            self::incStat( 1, "keepDirectionNumber" );
        }

        if (intval(self::getGameStateValue('chooseDirectionPick')) > 0) {
            self::setGameStateValue('chooseDirectionPick', 0);
            $this->gamestate->nextState('nextPlayer');
        } else {
            $this->gamestate->nextState('setDirection');
        }
    }
    
    // Play a farmer card from player hand
    function playFarmer(int $cardId) {
        self::checkAction("playFarmer");  
              
        $player_id = self::getActivePlayerId();
        $this->controlFarmerCardInHand($player_id, $cardId);

        $card = $this->getFarmerCardFromDb($this->farmerCards->getCard($cardId));
        $this->controlFarmerCardPlayable($card, $player_id);

        $this->farmerCards->moveCard($cardId, 'discard');

        $nextState = 'playFarmer';
        if ($card->type == 1) {
            self::setGameStateValue('cantPlaySpecial', 1);
        } else if ($card->type == 2) {
            $nextState = 'playFarmerWithOpponentSelection';
            self::setGameStateValue('lookOpponentHand', 1);
        } else if ($card->type == 3) {
            $nextState = 'playFarmerWithOpponentSelection';
            self::setGameStateValue('exchangeCard', 1);
        } else if ($card->type == 4) {
            self::setGameStateValue('cowPlayed', 1);
            $this->gamestate->nextState('playFarmer');
        } else if ($card->type == 5) {
            // TODO in 2 players, can player select row to remove ? or remove all ?
            $this->removeHerdAndNotify(null);
            self::setGameStateValue('cowPlayed', 0);
        } else if ($card->type == 6) {
            $this->pickFarmerCard($player_id);
            $this->pickFarmerCard($player_id);
        } else if ($card->type == 7) {
            $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $playerId));
            $centerCards = array_values(array_filter($player_hand, function($card) { return $card->number >= 7 && $card->number <= 9; }));
            $number = count($centerCards);
            if ($number > 0) { // TODO should we block if card has no effect ?
                $this->cards->moveCards(array_map(function($card) { return $card->id; }, $centerCards), 'discard');
                $newCards = $this->getCardsFromDb($this->cards->pickCards(count($centerCards), 'hand', $playerId));

                self::notifyPlayer($player_id, 'replaceCards', '', [
                    'playerId' => $player_id,
                    'oldCards' => $centerCards,
                    'newCards' => $newCards,
                ]);
            }
        } else if ($card->type == 8) {
            self::setGameStateValue( 'chooseDirectionPick', 1);
        } else if ($card->type == 9) {
            $removedCards = [];
            $players = self::loadPlayersBasicInfos();
            foreach( $players as $opponentId => $player ) {
                if ($player_id != $opponentId) {
                    $cardsInHand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $opponentId));

                    $cardsNumber = count($cardsInHand);
                    if ($cardsNumber > 0) {
                        $removedCard = $cardsInHand[bga_rand(1, $cardsNumber) - 1];
                        $this->cards->moveCard($removedCard->id, 'discard');
                        $removedCards[$opponentId] = $removedCard;
                    }
                }
            }

            foreach( $removedCards as $opponentId => $removedCard ) {
                self::notifyPlayer($opponentId, 'removedCard', 'Card TODO was removed from your hand', [
                    'playerId' => $opponentId,
                    'card' => $removedCard,
                ]);
            }
        }

        // And notify
        self::notifyAllPlayers('farmerCardPlayed', clienttranslate('${player_name} plays farmer card TODO'), [
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card' => $card,
        ]);

        $this->gamestate->nextState($nextState);
    }

    function setPlayer(int $playerId) {
        self::setGameStateValue('gotoPlayer', $playerId);

        if (intval(self::getGameStateValue('chooseDirectionPick')) > 0) {
            self::setGameStateValue('chooseDirectionPick', 0);
            $this->gamestate->nextState('nextPlayer');
        } else {
            $this->gamestate->nextState('setPlayer');
        }
    }

    function collectHerd() {
        // collected cards go to the side
        
        $player_id = self::getActivePlayerId();

        $herdCards = $this->getCardsFromDb($this->cards->getCardsInLocation( "herd"));
        $collectedPoints = $this->getCardsValues($herdCards);
        $this->collectedCardsStats($herdCards, $player_id);

        $sql = "UPDATE player SET player_score=player_score-$collectedPoints, collected_points=collected_points-$collectedPoints WHERE player_id='$player_id'";
        self::DbQuery($sql);

        $this->removeHerdAndNotify($player_id);

        self::incStat( 1, "collectedHerdsNumber" );
            
        // And notify
        self::notifyAllPlayers('herdCollected', clienttranslate('${player_name} collects herd'), [
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'points' => $collectedPoints
        ]);

        self::setGameStateValue('cantPlaySpecial', 0);

        if (count($this->cards->getCardsInLocation( "deck" )) > 0) {
            $this->gamestate->nextState('collectHerd');
        } else {
            $this->gamestate->nextState('collectLastHerd');
        }
    }

    function removeHerdAndNotify($player_id) {  
        $this->cards->moveAllCardsInLocation( "herd", "discard", null, $player_id );
        $sql = "UPDATE cow SET card_slowpoke_type_arg=null WHERE card_slowpoke_type_arg is not null";
        self::DbQuery($sql);
            
        // And notify
        if ($player_id) {
            self::notifyAllPlayers('herdCollected', clienttranslate('${player_name} collects herd'), [
                'player_id' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $collectedPoints
            ]);
        } else {
            self::notifyAllPlayers('herdCollected', clienttranslate('Herd removed'), [
                'player_id' => 0,
            ]);
        }
    }

    function passFarmer() {
        $this->gamestate->nextState('pass');
    }

    function pickFarmerCard($playerId) {
        $farmerCard = $this->getFarmerCardFromDb($this->farmerCards->pickCard('deck', $playerId));
        if ($farmerCard) {
            self::notifyPlayer($playerId, 'newFarmerCard', '', [
                'card' => $farmerCard
            ]);
        }
    }       
    
    function viewCards($playerId) {
        self::setGameStateValue('lookOpponentHand', $playerId);
        $this->gamestate->nextState('viewCards');
    }

    function exchangeCard($playerId) {
        self::setGameStateValue('exchangeCard', $playerId);
        $this->gamestate->nextState('exchangeCard');
    }

    function swap($playerId) {
        $swappingPlayerId = intval(self::getGameStateValue('swapping_player'));
        if ($playerId != 0 && $swappingPlayerId != $playerId) {
            self::notifyAllPlayers('handSwapped', clienttranslate('${player_name} swaps cards in hand with ${player_name2}'), [
                'player_name' => self::getUniqueValueFromDB("SELECT player_name FROM player where player_id = $swappingPlayerId"),
                'player_name2' => self::getUniqueValueFromDB("SELECT player_name FROM player where player_id = $playerId")
            ]);

            $this->cards->moveAllCardsInLocation( "hand", "swap", $playerId);
            $this->cards->moveAllCardsInLocation( "hand", "hand", $swappingPlayerId, $playerId);
            $this->cards->moveAllCardsInLocation( "swap", "hand", null, $swappingPlayerId);
            
            $swappers = [$swappingPlayerId, $playerId];
            foreach($swappers as $notifPlayerId) {
                $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $notifPlayerId));
                // Notify player about his cards
                self::notifyPlayer($notifPlayerId, 'newHand', '', [
                    'cards' => $cards
                ]);
            }
            
            self::setGameStateValue('swapping_player', 0);
        }

        $this->gamestate->nextState('playerTurn');
    }

    function ignoreFlies(int $playerId, int $type) {
        if ($playerId > 0) {
            // TODO check remaining in hand cards are taken into account
            $playerDiscard = $this->getCardsFromDb($this->cards->getCardsInLocation('discard', $notifPlayerId));
            $removedCards = array_values(array_filter($playerDiscard, function ($card) use ($type) { return $card->type == $type; }));

            $cardsValue = $this->getCardsValues($removedCards);

            if ($cardsValue > 0) {
                $sql = "UPDATE player SET player_score = player_score - $cardsValue, hand_points = hand_points - $cardsValue WHERE player_id = $player_id";
                self::DbQuery($sql);
            }

            $this->cards->moveCards(array_map(function($card) { return $card->id; }, $removedCards), "discard");            
        }
        $this->gamestate->setPlayerNonMultiactive($playerId, "endHand");
    }

    function getFarmerCardSelectFliesType() {
        return $this->getFarmerCardsFromDb($this->farmerCards->getCardsOfType(10)[0]);
    }

    function opponentCardsViewed() {
        $this->gamestate->nextState('next');
    }

    function giveCard( $cardId ) {
        $player_id = self::getActivePlayerId();
        $opponentId = intval(self::getGameStateValue('exchangeCard'));

        $card = $this->getCardFromDb($this->cards->getCard($cardId));

        self::notifyPlayer($player_id, 'removedCard', clienttranslate('Card TODO was given to chosen opponent'), [
            'playerId' => $player_id,
            'card' => $card,
        ]);

        $this->cards->moveCard($cardId, 'hand', $opponentId);

        self::notifyPlayer( $opponentId, 'newCard', clienttranslate('${player_name} gives you card TODO'), [
            'card' => $card,
            'player_name' => self::getActivePlayerName(),
        ]);

        $this->gamestate->nextState('giveCard');
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
        $player_id = self::getActivePlayerId();

        // check if player can collect
        $herd = $this->cards->getCardsInLocation('herd');
        $canCollect = count($herd) > 0;

        // check if player can play
        $canPlay = false;
        $hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $player_id));
        foreach ($hand as $card) {
            try {
                $this->controlCardPlayable($card);
                $canPlay = true;
                break;
            } catch (Exception $e) {}
        }

        $suffix = '';
        if (!$canCollect) {
            $suffix = 'noHerd';
        } else if (!$canPlay) {
            $suffix = 'mustTake';
        }

        return [
            'canCollect' => $canCollect,
            'suffix' => $suffix,
        ];
    }

    function argChooseDirection() {
        return [
            'direction_clockwise' => intval(self::getGameStateValue('direction_clockwise')) == 1,
            'canPick' => intval(self::getGameStateValue('canPick')) == 1
        ];  
    }

    function argPlayFarmer() {
        $player_id = self::getActivePlayerId();
        // TODO
    }

    function argSelectOpponent() {
        return [
            'lookOpponentHand' => intval(self::getGameStateValue('lookOpponentHand')) == 1,
            'exchangeCard' => intval(self::getGameStateValue('exchangeCard')) == 1,
        ];
    }

    function argViewCards() {
        $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', intval(self::getGameStateValue('lookOpponentHand'))));

        return [
            'cards' => $player_hand,
        ];
    }

    function argGiveCard() {
        $player_id = self::getActivePlayerId();
        $opponentId = intval(self::getGameStateValue('exchangeCard'));

        $cardsInHand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $opponentId));
        $removedCard = null;
        $cardsNumber = count($cardsInHand);
        if ($cardsNumber > 0) {
            $removedCard = $cardsInHand[bga_rand(1, $cardsNumber) - 1];
            $this->cards->moveCard($removedCard->id, 'hand', $player_id);
            $removedCards[$opponentId] = $removedCard;

            self::notifyPlayer($opponentId, 'removedCard', 'Card TODO was removed from your hand', [
                'playerId' => $opponentId,
                'card' => $removedCard,
            ]);
        }

        return [
            'card' => $removedCard,
        ];
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
	
    function stNewHand() {
        // Take back all cards (from any location => null) to deck
        $this->cards->moveAllCardsInLocation( null, "deck" );
        $this->cards->shuffle( 'deck' );
    
	    self::DbQuery("UPDATE player SET hand_points = 0, collected_points = 0 WHERE 1");
        //self::notifyAllPlayers('cleanUp');

        $players = self::loadPlayersBasicInfos();
        $remainingCards = count($this->cards->getCardsInLocation( 'deck' )) - (5 * count($players));

        // Deal 5 cards to each players
        // Create deck, shuffle it and give 5 initial cards
        foreach( $players as $player_id => $player ) {
            $cards = $this->getCardsFromDb($this->cards->pickCards( 5, 'deck', $player_id));
            
            // Notify player about his cards
            self::notifyPlayer( $player_id, 'newHand', '', [
                'cards' => $cards,
                'remainingCards' => $remainingCards
            ]);
        }

        $swapPlayerId = 0;
        if (!$this->isSimpleVersion()) {
            $sql = "SELECT min(player_score) FROM player  ";
            $players = self::getObjectListFromDB("SELECT player_id, player_score FROM player where player_score < 0 order by player_score ASC");
            if (count($players) >= 1) { // TODO what if some players have same lowest score ?
                $swapPlayerId = intval($players[0]['player_id']);
                self::setGameStateValue('swapping_player', $swapPlayerId);
            }
        }

        $this->gamestate->nextState( $swapPlayerId > 0 ? "swapHands" : "playerTurn" );
    }
    
    function stPlayAgain() {
        if ($this->isSimpleVersion()) {
            $this->gamestate->nextState('nextPlayer');
        } else if (intval(self::setGameStateValue('cowPlayed')) > 0) {
            $player_id = self::getActivePlayerId();
            $farmerCardsInHand = $this->getFarmerCardsFromDb($this->farmerCards->getCardsInLocation('hand', $player_id));

            $hasPlayableCards = false;
            foreach ($farmerCardsInHand as $card) {
                try {
                    $this->controlFarmerCardPlayable($card, $player_id);
                    $hasPlayableCards = true;
                    break;
                } catch (Exception $e) {}
            }

            if ($hasPlayableCards) {
                $this->gamestate->nextState('playAgain');
            } else { // end of turn
                if (intval(self::getGameStateValue('chooseDirectionPick')) > 0) {
                    $this->gamestate->nextState('chooseDirectionPick');
                } else {
                    $this->gamestate->nextState('nextPlayer');
                }
            }
        } else {
            $this->gamestate->nextState('playCard');
        }
    }
    
    function stNextPlayer() {
        self::setGameStateValue('cowPlayed', 0);

        $player_id = self::getActivePlayerId();

        $players = self::loadPlayersBasicInfos();
        $nbr_players = self::getPlayersNumber();

        $gotoPlayer = intval(self::getGameStateValue('gotoPlayer'));
        if ($gotoPlayer > 0) {
            $this->gamestate->changeActivePlayer($gotoPlayer);
            $player_id = $gotoPlayer;
            self::setGameStateValue('gotoPlayer', 0);
        } else {
            if (intval(self::getGameStateValue('direction_clockwise')) == 1) {
                $player_id = self::activePrevPlayer();
            } else {
                $player_id = self::activeNextPlayer();
            }
        }
        self::giveExtraTime($player_id);

        $this->gamestate->nextState( 'nextPlayer' );
    }

    function stCollectHand() {

        $players = self::loadPlayersBasicInfos();
        foreach( $players as $player_id => $player ) {
            $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $player_id));
            $cardsValue = $this->getCardsValues($player_hand);
            $this->collectedCardsStats($player_hand, $player_id);

            if ($cardsValue > 0) {
                $sql = "UPDATE player SET player_score = player_score - $cardsValue, hand_points = hand_points - $cardsValue WHERE player_id = $player_id";
                self::DbQuery($sql);
                    
                // And notify
                self::notifyAllPlayers('handCollected', clienttranslate('${player_name} collects points in his hand'), [
                    'player_id' => $player_id,
                    'player_name' => $player['player_name'],
                    'points' => $cardsValue
                ]);
            }
        }


        if (!$this->isSimpleVersion() && $this->getFarmerCardSelectFliesType()->location == 'hand') {
            $this->gamestate->nextState( "selectFliesType" );
        } else {
            $this->gamestate->nextState( "endHand" );
        }
    }

    function stEndHand() {
        if (!$this->isSimpleVersion()) {
            // TODO what if one of this cards is in players hand at the end ?
            // we reset player's points to 0 for this hand if he got the 6 5-flies cards
            $sql = "SELECT card_location_arg FROM `cow` where card_location = 'discard' and card_type = 5 group by card_location_arg having count(*) >= 6";
            $playerId = intval(self::getUniqueValueFromDB($sql));

            if ($playerId > 0) {
                $sql = "UPDATE player SET player_score = player_score - (hand_points + collected_points), hand_points = 0, collected_points = 0 WHERE player_id = $playerId";
                self::DbQuery($sql);

                self::notifyAllPlayers('allTopFlies', clienttranslate('${player_name} got all 5 flies cards, his points in this hand are erased'), [
                    'playerId' => $playerId,
                    'player_name' => self::getUniqueValueFromDB("SELECT player_name FROM player where player_id = $playerId"),
                    'points' => intval(self::getUniqueValueFromDB("SELECT player_score FROM player where player_id = $playerId")),
                ]);
            }

            // TODO can a player getting top flies with all black cards also get farmer card ?
            $sql = "SELECT player_id FROM `player` WHERE (hand_points + collected_points) > 0 order by (hand_points + collected_points) desc limit 1";
            $playerId = intval(self::getUniqueValueFromDB($sql));
            if ($playerId > 0) {
                $this->pickFarmerCard($playerId);
            }
        }

        $players = self::getObjectListFromDB("SELECT * FROM player");
        /// Display table window with results ////

        // Header line
        $headers = [''];
        $collectedPoints = [ ['str' => clienttranslate('Collected points'), 'args' => [] ] ];
        $remainingPoints = [ ['str' => clienttranslate('Remaining cards points'), 'args' => [] ] ];
        $handPoints = [ ['str' => clienttranslate('Hand points'), 'args' => [] ] ];
        $totalPoints = [ ['str' => clienttranslate('Total points'), 'args' => [] ] ];
        foreach ($players as $player) {
            $headers[] = [
                'str' => '${player_name}',
                'args' => ['player_name' => $player['player_name']],
                'type' => 'header'
            ];
            $playerId = intval($player['player_id']);
            $playerCollectedPoints = intval($player['collected_points']);
            $playerRemainingPoints = intval($player['hand_points']);

            $collectedPoints[] = $playerCollectedPoints;
            $remainingPoints[] = $playerRemainingPoints;
            $handPoints[] = $playerCollectedPoints + $playerRemainingPoints;
            $totalPoints[] = $player['player_score'];

            self::incStat($playerCollectedPoints, 'collectedPoints');
            self::incStat($playerCollectedPoints, 'collectedPoints', $playerId);
            self::incStat($playerRemainingPoints, 'remainingPoints');
            self::incStat($playerRemainingPoints, 'remainingPoints', $playerId);
        }
        $table = [$headers, $collectedPoints, $remainingPoints, $handPoints, $totalPoints];

        // Test if this is the end of the game
        $sql = "SELECT min(player_score) FROM player ";
        $minscore = self::getUniqueValueFromDB( $sql );
        $end = intval($minscore) <= -END_SCORE;

        $this->notifyAllPlayers( "tableWindow", '', [
            "id" => 'finalScoring',
            "title" => clienttranslate('Result of hand'),
            "table" => $table,
            "closing" => $end ? clienttranslate("End of game") : clienttranslate("Next hand")
        ]);
        
        $sql = "SELECT player_id  FROM player where player_score=(select min(player_score) from player) limit 1";
        $minscore_player_id = self::getUniqueValueFromDB( $sql );

        $this->gamestate->changeActivePlayer( $minscore_player_id );

        $this->gamestate->nextState($end ? "endGame" : "nextHand");
    }

    function stSelectFliesType() {
        $this->gamestate->setPlayersMultiactive([intval($this->getFarmerCardSelectFliesType()->location_arg)], 'choose');
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

    function zombieTurn($state, $active_player) {   
        $this->gamestate->nextState("zombiePass");
    }
}
