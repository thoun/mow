<?php

trait ActionTrait {

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
        $this->cards->moveCard($card_id, 'herd', $this->getActiveRow());

        self::setGameStateValue('cowPlayed', 1);

        $cantPlaySpecial = intval(self::getGameStateValue('cantPlaySpecial'));
        if ($cantPlaySpecial > 0 && intval($player_id) != $cantPlaySpecial) {
            self::setGameStateValue('cantPlaySpecial', 0);
        }
            
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
        self::notifyAllPlayers('cardPlayed', clienttranslate('${player_name} plays ${card_display}'), [
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'remainingCards' => count($this->cards->getCardsInLocation( 'deck' )),
            'slowpokeNumber' => $slowpokeNumber,
            'row' => $this->getActiveRow(),
            'card' => $card,
        ]);

        // get new card if possible
        $dbCard = $this->cards->pickCard('deck', $player_id);
        if ($dbCard) {
            $newCard = $this->getCardFromDb($dbCard);
            $allowedCardsIds = self::getPlayersNumber() > 2 ? $this->getAllowedCardsIds($player_id) : null;
            self::notifyPlayer( $player_id, 'newCard', '', [
                'card' => $newCard,
                'allowedCardsIds' => $allowedCardsIds
            ]);
        }

        // notify all players
        $players = self::loadPlayersBasicInfos();
        foreach ($players as $pId => $player) {
            $allowedCardsIds = self::getPlayersNumber() > 2 ? $this->getAllowedCardsIds($pId) : null;

            self::notifyPlayer( $pId, 'allowedCards', '', [
                'allowedCardsIds' => $allowedCardsIds
            ]);
        }
        
        // changing direction is useless with 2 players
        $canChooseDirection = $card->type === 5 && (self::getPlayersNumber() > 2 || !$this->isSimpleVersion());
        if ($canChooseDirection) {
            self::setGameStateValue('canPick', ($displayedNumber == 0 || $displayedNumber == 16) ? 1 : 0);
        } else {
            $rowNumber = $this->getHerdNumber();
            if ($rowNumber > 1) {
                $this->setNextActiveRow();
            }
        }
        // Next player
        $this->gamestate->nextState($canChooseDirection ? 'chooseDirection' : 'playCard');
    }

    function setNextActiveRow() {
        $rowNumber = $this->getHerdNumber();
        $down = intval(self::getGameStateValue( 'direction_clockwise' )) == 1;
        $activeRow = $this->getActiveRow();

        if ($down) {
            $activeRow = ($activeRow + 1) % $rowNumber;
        } else {
            $activeRow = ($activeRow + $rowNumber - 1) % $rowNumber;
        }
        self::setGameStateValue('activeRow', $activeRow);

        self::notifyAllPlayers('activeRowChanged', '', [
            'activeRow' => $activeRow,
        ]);
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

        $rowNumber = $this->getHerdNumber();
        if ($rowNumber > 1) {
            $this->setNextActiveRow();
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
            self::setGameStateValue('cantPlaySpecial', $player_id);
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
            $this->removeHerdAndNotify(null, null);
            self::setGameStateValue('cowPlayed', 0);
        } else if ($card->type == 6) {
            $this->pickFarmerCard($player_id);
            $this->pickFarmerCard($player_id);
        } else if ($card->type == 7) {
            $player_hand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $player_id));
            $centerCards = array_values(array_filter($player_hand, fn($card) => $card->number >= 7 && $card->number <= 9)); // acrobatic 7 and 9 are not included
            $number = count($centerCards);
            if ($number > 0) {
                $this->cards->moveCards(array_map(fn($card) => $card->id, $centerCards), 'discard');
                $newCards = $this->getCardsFromDb($this->cards->pickCards(count($centerCards), 'hand', $player_id));

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
                self::notifyPlayer($opponentId, 'removedCard', 'Card ${card_display} was removed from your hand', [
                    'playerId' => $opponentId,
                    'card' => $removedCard,
                ]);
            }
        }

        // And notify
        $this->farmerCardPlayed($player_id, $card);

        $this->gamestate->nextState($nextState);
    }

    function setPlayer(int $playerId) {
        if ($this->getHerdNumber() > 1) {

            $activeRow = $playerId;
            self::setGameStateValue('activeRow', $activeRow);

            self::notifyAllPlayers('activeRowChanged', '', [
                'activeRow' => $activeRow,
            ]);
            
            $this->gamestate->nextState('nextPlayer');
        } else {
            self::setGameStateValue('gotoPlayer', $playerId);

            if (intval(self::getGameStateValue('chooseDirectionPick')) > 0) {
                self::setGameStateValue('chooseDirectionPick', 0);
                $this->gamestate->nextState('nextPlayer');
            } else {
                $this->gamestate->nextState('setPlayer');
            }
        }
    }

    function collectHerd() {
        // collected cards go to the side
        
        $player_id = self::getActivePlayerId();

        $herdCards = $this->getCardsFromDb($this->cards->getCardsInLocation("herd", $this->getActiveRow()));
        $collectedPoints = $this->getCardsValues($herdCards);
        $this->collectedCardsStats($herdCards, $player_id);

        $sql = "UPDATE player SET collected_points = collected_points + $collectedPoints WHERE player_id='$player_id'";
        self::DbQuery($sql);

        $this->removeHerdAndNotify($player_id, $collectedPoints);

        self::incStat( 1, "collectedHerdsNumber" );

        $cantPlaySpecial = intval(self::getGameStateValue('cantPlaySpecial'));
        if ($cantPlaySpecial > 0 && intval($player_id) != $cantPlaySpecial) {
            self::setGameStateValue('cantPlaySpecial', 0);
        }

        if (count($this->cards->getCardsInLocation( "deck" )) > 0) {
            $this->gamestate->nextState('collectHerd');
        } else {
            $this->gamestate->nextState('collectLastHerd');
        }
    }

    function removeHerdAndNotify($player_id, $collectedPoints) {  
        $this->cards->moveAllCardsInLocation( "herd", "discard", $this->getActiveRow(), $player_id ? $player_id : 0);
        $sql = "UPDATE cow SET card_slowpoke_type_arg=null WHERE card_slowpoke_type_arg is not null";
        self::DbQuery($sql);
            
        // And notify
        if ($player_id) {
            self::notifyAllPlayers('herdCollected', clienttranslate('${player_name} collects herd'), [
                'player_id' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $collectedPoints,
                'row' => $this->getActiveRow(),
            ]);
        } else {
            self::notifyAllPlayers('herdCollected', clienttranslate('Herd removed'), [
                'player_id' => 0,
                'row' => $this->getActiveRow(),
            ]);
        }
    }

    function passFarmer() {
        if (intval(self::getGameStateValue('chooseDirectionPick')) > 0) {
            $this->gamestate->nextState('chooseDirectionPick');
        } else {
            $this->gamestate->nextState('pass');
        }
    }

    function pickFarmerCard(int $playerId) {
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
        if ($playerId > 0 && $type > 0) {
            $playerDiscard = array_merge(
                $this->getCardsFromDb($this->cards->getCardsInLocation('discard', $playerId)),
                $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $playerId))
            );
            $removedCards = array_values(array_filter($playerDiscard, fn($card) => $card->type == $type));
            $cardsValue = $this->getCardsValues($removedCards);

            if ($cardsValue > 0) {
                $sql = "UPDATE player SET cancelled_points = $cardsValue WHERE player_id = $playerId";
                self::DbQuery($sql);
            }

            $this->cards->moveCards(array_map(fn($card) => $card->id, $removedCards), "discard");  

            // And notify
            $farmerCard = $this->getFarmerCardByType($playerId, 10);
            $this->farmerCardPlayed($playerId, $farmerCard);          
        }

        $this->gamestate->setPlayerNonMultiactive($playerId, "endHand");
    }

    function getFarmerCardSelectFliesType() {
        return $this->getFarmerCardFromDb(array_values($this->farmerCards->getCardsOfType(10))[0]);
    }

    function opponentCardsViewed() {
        // card cleared when played

        $this->gamestate->nextState('next');
    }

    function giveCard(int $cardId) {
        $playerId = self::getActivePlayerId();
        $opponentId = intval(self::getGameStateValue('exchangeCard'));

        $card = $this->getCardFromDb($this->cards->getCard($cardId));

        self::notifyPlayer($playerId, 'removedCard', clienttranslate('Card ${card_display} was given to chosen opponent'), [
            'playerId' => $playerId,
            'card' => $card,
            'fromPlayerId' => $opponentId,
        ]);

        $this->cards->moveCard($cardId, 'hand', $opponentId);
        $allowedCardsIds = self::getPlayersNumber() > 2 ? $this->getAllowedCardsIds($opponentId) : null;

        self::notifyPlayer( $opponentId, 'newCard', clienttranslate('${player_name} gives you card ${card_display}'), [
            'card' => $card,
            'player_name' => $this->getPlayerName($playerId),
            'fromPlayerId' => $playerId,
            'allowedCardsIds' => $allowedCardsIds
        ]);

        // card cleared when played

        $this->gamestate->nextState('giveCard');
    }

    function getAllowedFarmerCards() {
        $player_id = self::getActivePlayerId();
        
        $farmerCardsInHand = $this->getFarmerCardsFromDb($this->farmerCards->getCardsInLocation('hand', $player_id));

        $allowedCards = [];
        foreach($farmerCardsInHand as $card) {
            try {
                $this->controlFarmerCardPlayable($card, $player_id);
                $allowedCards[] = $card;
            } catch (Exception $e) {}
        }

        return $allowedCards; 
    }

    function getAllowedFarmerCardsId() {
        $allowedCards = $this->getAllowedFarmerCards();

        return array_map(fn($card) => $card->id, $allowedCards); 
    }
}
