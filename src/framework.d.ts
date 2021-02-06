/**
 * Framework interfaces
 */

interface Game {
    setup: (gamedatas: any) => void;
    onEnteringState: (stateName: string, args: any) => void;
    onLeavingState: (stateName: string ) => void;
    onUpdateActionButtons: (stateName: string, args: any) => void;
    setupNotifications: () => void;
    //format_string_recursive: (log: string, args: any) => void;
}

interface Notif<T> {
    args: T;
    log: string;
    move_id: number;
    table_id: string;
    time: number;
    type: string;
    uid: string;
}

/* TODO repace Function by (..params) => void */
interface Dojo {
    place: Function;
    style: Function;
    hitch: Function;
    addClass: Function;
    removeClass: Function;
    connect: Function;
    query: Function;
    subscribe: Function;
    string: any;
    fx: any;
    marginBox: Function;
    fadeIn: Function;
    trim: Function;
}

type Gamestate = any;

interface Player {
    beginner: boolean;
    color: string;
    color_back: any | null;
    eliminated: number;
    id: string;
    is_ai: string;
    name: string;
    score: string;
    zombie: number;
}

interface Stock {
    items: any;
    item_type: any;
    create: Function;
    setSelectionMode: (selectionMode: number) => void;            
    centerItems: boolean;
    updateDisplay: (from: string) => void;
    setSelectionAppearance: (appearance: string) => void;            
    onItemCreate: Function; 
    addToStockWithId: (cardUniqueId: number, cardId: string, from?: string) => void;
    addItemType: ( card_type_id, cardWeight, cardsurl, id ) => void;	
    getSelectedItems: () => Card[];
    unselectAll: () => void;
    removeAll: () => void;
    removeFromStockById: (id: string) => void;
    removeAllTo: (to: string) => void;
    unselectItem: (id: string) => void;
}

interface Card {
    id: string;
    location: string;
    location_arg: string;
    type: string;
    type_arg: string;
    slowpoke_type_arg?: string;
}