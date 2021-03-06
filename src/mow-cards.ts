declare const g_gamethemeurl;
declare const _;

class MowCards {
    public createCards(stocks: Stock[]) {
        const idsByType: number[][] = [[], [], [], []];
        
        // Create cards types:
        for(let number=1; number<=15; number++) {  // 1-15 green
            idsByType[0].push(number);
        }
        
        for(let number=2; number<=14; number++) {  // 2-14 yellow
            idsByType[1].push(number);
        }
        
        for(let number=3; number<=13; number++) {  // 3-13 orange
            idsByType[2].push(number);
        }
        
        for(let number=7; number<=9; number++) {  // 7,8,9 red
            idsByType[3].push(number);
        }

        idsByType[5] = [0, 16, 21, 22, 70, 90];

        idsByType.forEach((idByType, type) => {
            const cardsurl = `${g_gamethemeurl}img/cards${type}.jpg`;

            idByType.forEach((cardId, id) =>
                stocks.forEach(stock => 
                    stock.addItemType(
                        this.getCardUniqueId(type, cardId), 
                        this.getCardWeight(type, cardId), 
                        cardsurl, 
                        id
                    )
                )
            );
        });
    }     
    
    public getCardUniqueId(color: number, value: number) {
        return color * 100 + value;
    }
    
    public getCardWeight(color: number, value: number) {
        let displayedNumber = value;
        if (displayedNumber === 70 || displayedNumber === 90) {
            displayedNumber /= 10;
        }
        return displayedNumber * 100 + color;
    }

    getTooltip(cardTypeId: number)
    {
        let tooltip = `<div class="tooltip-fly"><span class="tooltip-fly-img"></span> : ${Math.floor(cardTypeId / 100)}</div>`;
        switch( cardTypeId ) {
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