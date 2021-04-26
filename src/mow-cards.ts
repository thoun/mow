class FarmerCards {
    public createCards(stocks: Stock[]) {
        const cardsurl = `${g_gamethemeurl}img/farmers.jpg`;

        stocks.forEach(stock => {
            for(let number=1; number<=10; number++) {
                stock.addItemType(
                    number, 
                    number, 
                    cardsurl, 
                    number - 1
                );
            }
        });
    }

    /*public getTooltip(cardTypeId: number) {
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
    }*/
}