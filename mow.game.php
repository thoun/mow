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

require_once('modules/php/constants.inc.php');
require_once("modules/php/objects/card.php");
require_once("modules/php/objects/farmer-card.php");
require_once('modules/php/utils.php');
require_once('modules/php/actions.php');
require_once('modules/php/states.php');
require_once('modules/php/args.php');
require_once('modules/php/debug-util.php');

class mow extends Table {
    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use DebugUtilTrait;

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
                'activeRow' => 15,
                'rowNumber' => 16,

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
    protected function setupNewGame($players, $options = []) {    
        $sql = "DELETE FROM player WHERE 1 ";
        self::DbQuery($sql); 

        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the game
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'direction_clockwise', 1 );
        self::setGameStateInitialValue( 'swapping_player', 0 );
        self::setGameStateInitialValue( 'canPick', 0 );
        self::setGameStateInitialValue( 'gotoPlayer', 0 );
        self::setGameStateInitialValue( 'cowPlayed', 0 );
        self::setGameStateInitialValue( 'activeRow', 0 );
        self::setGameStateInitialValue( 'rowNumber', !$this->isSimpleVersion() && count(array_keys($players)) == 2 ? 3 : 1 );
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
               
        $this->cards->createCards($cards, 'deck');
        $this->cards->shuffle('deck');
        
        $farmerCards = [];
        for ($value=1; $value<=10; $value++) {
			$farmerCards[] = ['type' => $value, 'type_arg' => $this->farmers_placement[$value], 'nbr' => 1];
		}
        $this->farmerCards->createCards($farmerCards, 'deck');
        $this->farmerCards->shuffle('deck');

        // TODO TEMP card to test
        $this->debugSetup(array_keys($players));

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

        $herdNumber = $this->getHerdNumber();
        
        // Cards played on the table
        $result['herdNumber'] = $herdNumber;
        $herds = [];

        for ($iHerd=0; $iHerd<$herdNumber; $iHerd++) {
            $herds[$iHerd] = $this->getCardsFromDb($this->cards->getCardsInLocation('herd', $iHerd));
        }
        
        $sql = "SELECT card_id id, card_slowpoke_type_arg slowpoke_type_arg FROM cow WHERE card_type_arg in (21, 22) and card_slowpoke_type_arg is not null";
        $slowpokes = array_map(function($db) { 
            $slowpoke = new stdClass();
            $slowpoke->id = intval($db['id']);
            $slowpoke->slowpokeNumber = intval($db['slowpoke_type_arg']);
            return $slowpoke;
        }, array_values(self::getCollectionFromDb($sql)));
        foreach($slowpokes as $slowpoke) {
            for ($iHerd=0; $iHerd<$herdNumber; $iHerd++) {
                foreach($herds[$iHerd] as &$herdCard) {
                    if ($herdCard->id == $slowpoke->id) {
                        $herdCard->slowpokeNumber = $slowpoke->slowpokeNumber;
                    }
                }
            }
        }
        $result['herds'] = $herds;
        $result['activeRow'] = $this->getActiveRow();
        
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
        $minscore = self::getUniqueValueFromDB($sql);

        return -100 * $minscore / END_SCORE;
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
        if ($state['type'] == "activeplayer") {
            $this->gamestate->nextState("zombiePass");
            return;
        } else if ($state['type'] == "multipleactiveplayer") {            
            // Make sure player is in a non blocking status for role turn
            $sql = "
                UPDATE  player
                SET     player_is_multiactive = 0
                WHERE   player_id = $active_player
            ";
            $this->DbQuery($sql);

            $this->gamestate->updateMultiactiveOrNextState('endHand');
        }
    }
}
