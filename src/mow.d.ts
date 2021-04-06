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

interface MowGamedatas {
    allowedCardsIds: number[];
    current_player_id: string;
    decision: {decision_type: string};
    direction_clockwise: boolean;
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    hand: Card[];
    herd: Card[];
    neutralized_player_id: string;
    next_players_id: { [playerId: number]: number };
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: Player };
    remainingCards: number;
    tablespeed: string;
}

interface MowHerdStock extends Stock {
    acrobatic_overlap: number;
    isAcrobatic: (stockItemId: number) => boolean;
}

interface NotifNewHandArgs {
    cards: Card[];
    remainingCards: number;
}

interface NotifCardPlayedArgs {
    player_id: string; 
    color: number; 
    number: number; 
    card_id: number; 
    slowpokeNumber: number;
    remainingCards: number;
}

interface NotifAllowedCardsArgs {
    allowedCardsIds: number[];
}

interface NotifNewCardArgs {
    card: Card;
}

interface DirectionChangedArgs {
    direction_clockwise: boolean;
}

interface NotifCollectedArgs {
    player_id: string;
    points: number;
}

type NotifHandCollectedArgs = NotifCollectedArgs;
type NotifHerdCollectedArgs = NotifCollectedArgs;

interface NotifAllTopFliesArgs {
    playerId: string;
    points: number;
}