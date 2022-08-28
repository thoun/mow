<?php

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function isSimpleVersion() {
        return intval(self::getGameStateValue('simpleVersion')) === 2;
    }

    function getActiveRow() {
        return intval(self::getGameStateValue('activeRow'));
    }

    function getHerdNumber() {
        return intval(self::getGameStateValue('rowNumber'));
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayerScore(int $playerId) {
        return intval(self::getUniqueValueFromDb("SELECT player_score - (collected_points + remaining_in_hand_points - cancelled_points) FROM player WHERE player_id = $playerId"));
    }

    function getOpponentId() {
        $playerId = $this->getActivePlayerId();
        $playersIds = array_keys($this->loadPlayersBasicInfos());
        return intval(array_values(array_filter($playersIds, fn($id) => $playerId != $id))[0]);
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
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbCards));
    }

    function getFarmerCardFromDb(/*array|null*/ $dbCard) {
        if ($dbCard == null) {
            return null;
        }

        if (!$dbCard || !array_key_exists('id', $dbCard)) {
            throw new Error('farmer card doesn\'t exists '.json_encode($dbCard));
        }
        if (!$dbCard || !array_key_exists('location', $dbCard)) {
            throw new Error('farmer location doesn\'t exists '.json_encode($dbCard));
        }
        return new FarmerCard($dbCard);
    }

    function getFarmerCardsFromDb(array $dbCards) {
        return array_map(fn($dbCard) => $this->getFarmerCardFromDb($dbCard), array_values($dbCards));
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
        if ($card->type == 5) {
            $cantPlaySpecial = intval(self::getGameStateValue('cantPlaySpecial'));
            if ($cantPlaySpecial > 0 && intval($this->getActivePlayerId()) != $cantPlaySpecial) {
                throw new BgaUserException(self::_("You can't play a special cow because of a farmer card"), true);
            }
        }

        $herdCards = $this->getCardsFromDb($this->cards->getCardsInLocation('herd', $this->getActiveRow()));

        //self::dump('herdCards', json_encode($herdCards));
        $herdNumbers = array_map(fn($current_card) =>
            ($current_card->type != 5 || $current_card->number == 0 || $current_card->number == 16) ? $current_card->number : -1
            , $herdCards);
        $herdDisplayedNumbers = array_filter($herdNumbers,  fn($k) => $k != -1);
        
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
        $validTime = false;
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

        if ($card->type == 5) {
            $herdCount = count($this->cards->getCardsInLocation('herd', $this->getActiveRow()));
            if ($herdCount == 0) {
                throw new BgaUserException(self::_("No card in the herd"), true);
            }
        }

        if ($card->type == 7) {
            $player_hand = $this->getcardsFromDb($this->cards->getCardsInLocation('hand', $playerId));
            $centerCardsNumber = count(array_values(array_filter($player_hand, fn($card) => $card->number >= 7 && $card->number <= 9)));

            if (intval($this->cards->countCardInLocation( 'deck' )) < $centerCardsNumber) {
                throw new BgaUserException(self::_("Not enough remaining cards to play this farmer card"), true);
            }
        }

        return true;
    }

    function getPlacesForSlowpoke() {
        $places = [];
        $herd = $this->getCardsFromDb($this->cards->getCardsInLocation('herd', $this->getActiveRow()));
        $herdWithoutSlowpokes = array_values(array_filter($herd, fn($card) => $card->number != 21 && $card->number != 22));

        usort($herdWithoutSlowpokes, fn ($a, $b) => $a->number - $b->number);
        //self::dump('$sortedHerdWithoutSlowpokes', json_encode($herdWithoutSlowpokes));

        $lastDisplayedNumber = null;
        $lastCard = null;
        $herdHasSlowpoke = count(array_filter($herd, fn($card) => $card->number == 21 || $card->number == 22)) > 0;
        $herdSlowPokeAlreadyPlaced = false;
        for($i=0;$i<count(array_values($herdWithoutSlowpokes));$i++) {
            $card = $herdWithoutSlowpokes[$i];
            //self::dump('$card', json_encode($card));

            if ($lastDisplayedNumber !== null) {
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
        return array_sum(array_map(fn($card) => $card->type, $cards));
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

    function getFarmerCardByType(int $playerId, int $type) {
        $farmerCardsInHand = $this->getFarmerCardsFromDb($this->farmerCards->getCardsInLocation('hand', $playerId));

        return $this->array_find($farmerCardsInHand, fn($card) => $card->type == $type);
    }

    function farmerCardPlayed(int $playerId, FarmerCard $card) {
        // And notify
        $this->notifyAllPlayers('farmerCardPlayed', clienttranslate('${player_name} plays farmer card ${farmerCardType}'), [
            'player_id' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'card' => $card,
            'farmerCardType' => $card->type,
        ]);
    }
}
