/**
 * Mow interfaces
 */

interface Card {
    id: number;
    location: string;
    location_arg: number;
    type: number;
    number: number;
    slowpokeNumber?: number;
}

interface FarmerCard {
    id: number;
    location: string;
    location_arg: number;
    type: number;
    time: number; // (see material.inc.php)
}

interface MowPlayer extends Player {
    cards: number;
    farmerCards: number;
}

interface MowGamedatas {
    allowedCardsIds: number[];
    current_player_id: string;
    decision: {decision_type: string};
    direction_clockwise: boolean;
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    hand: Card[];
    collectedCards: Card[];
    farmerHand: FarmerCard[];
    herdNumber: number;
    herds: Card[][];
    activeRow: number;
    neutralized_player_id: string;
    next_players_id: { [playerId: number]: number };
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: MowPlayer };
    remainingCards: number;
    tablespeed: string;
    simpleVersion: boolean;
}

interface MowHerdStock extends Stock {
    acrobatic_overlap: number;
    isAcrobatic: (stockItemId: number) => boolean;
}

interface EnteringLookCardsArgs {
    opponentId: number;
    cards: Card[];
}

interface SelectFliesTypeCount {
    number: number;
    points: Number;
}

interface EnteringSelectFliesTypeArgs {
    counts: { [type: number]: SelectFliesTypeCount};
}

interface NotifNewHandArgs {
    cards: Card[];
    remainingCards: number;
}

interface NotifCardPlayedArgs {
    card: Card;
    slowpokeNumber: number;
    player_id: string;
    card_id: number; 
    remainingCards: number;
    row: number;
}

interface NotifFarmerCardPlayedArgs {
    player_id: number; 
    card: FarmerCard;
}

interface NotifAllowedCardsArgs {
    allowedCardsIds: number[];
}

interface NotifNewCardArgs {
    card: Card;
    fromPlayerId?: number;
    allowedCardsIds: number[];
}

interface NotifNewFarmerCardArgs {
    card: FarmerCard;
}

interface NotifNewCardUpdateCounterArgs {
    playerId: number;
}

interface DirectionChangedArgs {
    direction_clockwise: boolean;
}

interface NotifCollectedArgs {
    player_id: string;
    points: number;
    playerScore: number;
    collectedCards: Card[];
}

type NotifHandCollectedArgs = NotifCollectedArgs;

interface NotifHerdCollectedArgs extends NotifCollectedArgs {
    row: number;
}

interface NotifAllTopFliesArgs {
    playerId: number;
    points: number;
}

interface NotifReplaceCardsArgs {
    playerId: number;
    oldCards: Card[];
    newCards: Card[];
}

interface NotifRemovedCardArgs {
    playerId: number;
    card: Card;
    fromPlayerId?: number;
}

interface NotifActiveRowChangedArgs {
    activeRow: number;
}