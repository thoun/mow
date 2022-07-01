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
            //foreach($playersIds as $playerId){ $this->farmerCards->pickCards(2, 'deck', $playerId); }	 
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
