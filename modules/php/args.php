<?php

trait ArgsTrait {
    
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
        $herd = $this->cards->getCardsInLocation('herd', $this->getActiveRow());
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
            'allowedCardIds' => $this->getAllowedCardsIds($player_id),
            'allowedFarmerCardIds' => $this->getAllowedFarmerCardsId(),
        ];
    }

    function argChooseDirection() {
        $canPick = intval(self::getGameStateValue('canPick')) == 1 || intval(self::getGameStateValue('chooseDirectionPick')) == 1;
        return [
            'direction_clockwise' => intval(self::getGameStateValue('direction_clockwise')) == 1,
            'canPick' => $canPick,
        ];  
    }

    function argPlayFarmer() {
        return [
            'allowedFarmerCardIds' => $this->getAllowedFarmerCardsId(),
        ]; 
    }

    function argSelectOpponent() {
        return [
            'lookOpponentHand' => intval(self::getGameStateValue('lookOpponentHand')) == 1,
            'exchangeCard' => intval(self::getGameStateValue('exchangeCard')) == 1,
        ];
    }

    function argViewCards() {
        $opponentId = intval(self::getGameStateValue('lookOpponentHand'));
        $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $opponentId));

        return [
            'opponentId' => $opponentId,
            'cards' => $player_hand,
        ];
    }

    function argSwapHands() {
        $playersIds = array_keys(self::loadPlayersBasicInfos());

        if (count($playersIds) == 2) {
            $opponentId = $this->getOpponentId();
            return [
                'opponentId' => $opponentId,
            ];
        }
        return [
            'opponentId' => null,
        ];
    }
}
