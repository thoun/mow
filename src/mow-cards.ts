declare const g_gamethemeurl;
declare const _;

class MowCards {
    public createCards(stocks: Stock[]) {
        const idsByType: number[][] = [[], [], [], []];
        
        // Create cards types:
        for(let value=1; value<=15; value++ ) {  // 1-15 green
            idsByType[0].push(value);
        }
        
        for(let value=2; value<=14; value++ ) {  // 2-14 yellow
            idsByType[1].push(value);
        }
        
        for(let value=3; value<=13; value++ ) {  // 3-13 orange
            idsByType[2].push(value);
        }
        
        for(let value=7; value<=9; value++ ) {  // 7,8,9 red
            idsByType[3].push(value);
        }

        idsByType[5] = [0, 16, 21, 22, 70, 90];

        for (let type in idsByType) {
            const cardsurl = g_gamethemeurl+'img/cards'+type+'.jpg';

            for (let id=0; id<idsByType[type].length; id++) {
                const cardId = idsByType[type][id];
                const card_type_id = this.getCardUniqueId(type, cardId);
                const cardWeight = this.getCardWeight(type, cardId);
                stocks.forEach(stock => stock.addItemType(card_type_id, cardWeight, cardsurl, id));	
            }
        }
    }     
    
    public getCardUniqueId( color: number | string, value: number | string ) {
        return Number(color)*100+Number(value);
    }
    
    public getCardWeight( color: number | string, value: number | string ) {
        let displayedNumber = Number(value);
        const iColor = Number(color);
        if (displayedNumber === 70 || displayedNumber === 90) {
            displayedNumber /= 10;
        }
        //return color;
        return displayedNumber*100+iColor;
    }

    getTooltip(card_type_id: number)
    {
        let tooltip = `<div class="tooltip-fly"><span class="tooltip-fly-img"></span> : ${Math.floor(card_type_id / 100)}</div>`;
        switch( card_type_id ) {
            case 500:
            case 516:
                tooltip += _("Blocker: Play this cow to close off one end of the line.");
                break;    
            case 570:
            case 590:
                tooltip += _("Acrobatic cow: Play this cow on another cow with the same number, no matter where it is in the line (this card cannot be played unless the requisite cow has been played previously).");
                break;            
            case 521:
            case 522:
                tooltip += _("Slowpoke: Insert this cow into the line in place of a missing number (this card cannot be placed if there are no gaps in the line numbering).");
                break;
        }
        return tooltip;
    }
}