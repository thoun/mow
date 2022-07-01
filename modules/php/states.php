<?php

trait StateTrait {

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
    
	    self::DbQuery("UPDATE player SET remaining_in_hand_points = 0, collected_points = 0, cancelled_points = 0 WHERE 1");

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
            $players = self::getObjectListFromDB("SELECT player_id, player_score FROM player where player_score < 0 order by player_score ASC");
            if (count($players) >= 1) {
                $swapPlayerId = intval($players[0]['player_id']);
                self::setGameStateValue('swapping_player', $swapPlayerId);
            }
        }

        $this->gamestate->nextState( $swapPlayerId > 0 ? "swapHands" : "playerTurn" );
    }
    
    function stPlayAgain() {
        if ($this->isSimpleVersion()) {
            $this->gamestate->nextState('nextPlayer');
        } else if (intval(self::getGameStateValue('cowPlayed')) > 0) {
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

    

    function stSelectOpponent() {
        $player_id = self::getActivePlayerId();
        $playersIds = array_keys(self::loadPlayersBasicInfos());

        if (count($playersIds) == 2) {
            $opponentId = $this->getOpponentId();
            if (intval(self::getGameStateValue('lookOpponentHand')) == 1) {
                self::setGameStateValue('lookOpponentHand', $opponentId);
                $this->gamestate->nextState('viewCards');
            } else if (intval(self::getGameStateValue('exchangeCard')) == 1) {
                self::setGameStateValue('exchangeCard', $opponentId);
                $this->gamestate->nextState('exchangeCard');
            }
        }
        return [
            'lookOpponentHand' => intval(self::getGameStateValue('lookOpponentHand')) == 1,
            'exchangeCard' => intval(self::getGameStateValue('exchangeCard')) == 1,
        ];
    }

    function stGiveCard() {
        $player_id = self::getActivePlayerId();
        $opponentId = intval(self::getGameStateValue('exchangeCard'));

        $cardsInHand = $this->getCardsFromDb($this->cards->getCardsInLocation('hand', $opponentId));
        $removedCard = null;
        $cardsNumber = count($cardsInHand);
        if ($cardsNumber > 0) {
            $removedCard = $cardsInHand[bga_rand(1, $cardsNumber) - 1];
            $this->cards->moveCard($removedCard->id, 'hand', $player_id);
            $removedCards[$opponentId] = $removedCard;

            self::notifyPlayer($opponentId, 'removedCard', clienttranslate('Card ${card_display} was removed from your hand'), [
                'playerId' => $opponentId,
                'card' => $removedCard,
                'fromPlayerId' => $player_id,
            ]);
            self::notifyAllPlayers('removedCardUpdateCounter', '', [
                'playerId' => $opponentId,
            ]);

            $allowedCardsIds = self::getPlayersNumber() > 2 ? $this->getAllowedCardsIds($player_id) : null;
            self::notifyPlayer($player_id, 'newCard', clienttranslate('Card ${card_display} was picked from ${player_name2} hand'), [
                'playerId' => $player_id,
                'player_name2' => $this->getPlayerName($opponentId),
                'card' => $removedCard,
                'fromPlayerId' => $opponentId,
                'allowedCardsIds' => $allowedCardsIds,
            ]);
            self::notifyAllPlayers('newCardUpdateCounter', '', [
                'playerId' => $player_id,
            ]);
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
                $sql = "UPDATE player SET remaining_in_hand_points = remaining_in_hand_points + $cardsValue WHERE player_id = $player_id";
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

    function stEndRound() {
        $resetPointsPlayerId = 0;
        $topPlayerId = 0;
        if (!$this->isSimpleVersion()) {
            // we reset player's points to 0 for this hand if he got the 6 5-flies cards
            $sql = "SELECT card_location_arg FROM `cow` where card_location = 'discard' and card_type = 5 group by card_location_arg having count(*) >= 6";
            $resetPointsPlayerId = intval(self::getUniqueValueFromDB($sql));

            if ($resetPointsPlayerId > 0) {
                $sql = "UPDATE player SET remaining_in_hand_points = 0, collected_points = 0, cancelled_points = 0 WHERE player_id = $resetPointsPlayerId";
                self::DbQuery($sql);
            

                self::notifyAllPlayers('allTopFlies', clienttranslate('${player_name} got all 5-flies cards, his points in this hand are erased'), [
                    'playerId' => $resetPointsPlayerId,
                    'player_name' => $this->getPlayerName($resetPointsPlayerId),
                ]);
            }

            $sql = "SELECT player_id FROM `player` WHERE (remaining_in_hand_points + collected_points - cancelled_points) > 0 order by (remaining_in_hand_points + collected_points - cancelled_points) DESC limit 1";
            $topPlayerId = intval(self::getUniqueValueFromDB($sql));
            if ($topPlayerId > 0) {
                $this->pickFarmerCard($topPlayerId);
            }
        }

        $sql = "UPDATE player SET player_score = player_score - (collected_points + remaining_in_hand_points - cancelled_points)";
        self::DbQuery($sql);

        $players = self::getObjectListFromDB("SELECT * FROM player");
        /// Display table window with results ////

        // Header line
        $headers = [''];
        $collectedPoints = [ ['str' => clienttranslate('Collected cards points'), 'args' => [] ] ];
        $remainingPoints = [ ['str' => clienttranslate('Remaining cards points'), 'args' => [] ] ];
        $roundPoints = [ ['str' => clienttranslate('Round points'), 'args' => [] ] ];
        $totalPoints = [ ['str' => clienttranslate('Total points'), 'args' => [] ] ];
        
        $playersScores = [];

        foreach ($players as $player) {
            $headers[] = [
                'str' => '${player_name}',
                'args' => ['player_name' => $player['player_name']],
                'type' => 'header'
            ];
            $playerId = intval($player['player_id']);
            $playerCollectedPoints = intval($player['collected_points']);
            $playerRemainingPoints = intval($player['remaining_in_hand_points']);
            $playerCancelledPoints = intval($player['cancelled_points']);

            $collectedPoints[] = $playerCollectedPoints;
            $remainingPoints[] = $playerRemainingPoints;

            $roundPointsCount = $playerCollectedPoints + $playerRemainingPoints;
            $roundPointStr = null;
            if ($playerId == $resetPointsPlayerId) {
                $roundPointStr = "<strike>".$roundPointsCount."</strike> 0";
            } else if ($playerCancelledPoints > 0) {
                $roundPointStr = "<strike>".$roundPointsCount."</strike> ".($roundPointsCount - $playerCancelledPoints);
            } else {
                $roundPointStr = $roundPointsCount;
            }
            $roundPointStr = $playerId == $topPlayerId ? '<span class="tooltip-fly-img"></span>' . $roundPointStr . '<span class="tooltip-fly-img"></span>' : $roundPointStr;
            $roundPoints[] = $roundPointStr;
            $totalPoints[] = -$player['player_score'];
            $playersScores[$playerId] = intval($player['player_score']);

            self::incStat($playerCollectedPoints, 'collectedPoints');
            self::incStat($playerCollectedPoints, 'collectedPoints', $playerId);
            self::incStat($playerRemainingPoints, 'remainingPoints');
            self::incStat($playerRemainingPoints, 'remainingPoints', $playerId);
        }
        $table = [$headers, $collectedPoints, $remainingPoints, $roundPoints, $totalPoints];


        // Test if this is the end of the game
        $sql = "SELECT min(player_score) FROM player ";
        $minscore = self::getUniqueValueFromDB( $sql );
        $end = intval($minscore) <= -END_SCORE;

        $this->notifyAllPlayers( "tableWindow", '', [
            "id" => 'finalScoring',
            "title" => clienttranslate('Result of hand'),
            "table" => $table,
            "playersScores" => $playersScores,
            "closing" => $end ? clienttranslate("End of game") : clienttranslate("Next hand")
        ]);
        
        $sql = "SELECT player_id FROM player where player_score=(select min(player_score) from player) limit 1";
        $minscore_player_id = self::getUniqueValueFromDB( $sql );

        $this->gamestate->changeActivePlayer( $minscore_player_id );

        $this->gamestate->nextState($end ? "endGame" : "nextHand");
    }

    function stSelectFliesType() {
        $this->gamestate->setPlayersMultiactive([intval($this->getFarmerCardSelectFliesType()->location_arg)], 'choose');
    }
}
