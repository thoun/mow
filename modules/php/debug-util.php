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
        foreach($playersIds as $playerId){ $this->farmerCards->pickCards(3, 'deck', $playerId); }	   
        
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
