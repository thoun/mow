<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup(array $playersIds) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

               
        // TODO TEMP
        //$this->cards->createCards( array_slice($cards, count($cards) - 15, 15), 'deck' );
        // TODO TEMP
        if (!$this->isSimpleVersion()) {
            //foreach($playersIds as $playerId){ $this->farmerCards->pickCards(3, 'deck', $playerId); }	 
        }  
        
    }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		$ids = [
            86175279,
53511104,
88267474
		];

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			$this->DbQuery("UPDATE cow SET card_location_arg=$sid WHERE card_location_arg = $id" );
			$this->DbQuery("UPDATE farmer SET card_location_arg=$sid WHERE card_location_arg = $id" );
			
			++$sid;
		}
	}

    function debugEmptyDeck() {
        $this->cards->moveAllCardsInLocation("deck", "discard");
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
