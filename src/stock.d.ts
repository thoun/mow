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