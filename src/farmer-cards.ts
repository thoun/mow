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

    public getTooltip(cardTypeId: number) {
        let tooltip = '';
        switch( cardTypeId ) {
            case 1: tooltip += _("The next player cannot play a special cow."); break;
            case 2: tooltip += _("Pick an opponent and look at their cards."); break;
            case 3: tooltip += _("Randomly pick a card from an opponent’s hand and then give them any card from your hand (or return their original card)."); break;
            case 4: tooltip += _("Skip your turn."); break;
            case 5: tooltip += _("Discard the current herd without adding it to anyone’s cowshed. Begin a new herd."); break;
            case 6: tooltip += _("Draw 2 Farmer cards."); break;
            case 7: tooltip += _("Discard any cows with the values 7, 8 and 9 from your hand. Draw the same number of cards from the draw pile to replace them. (You cannot perform this action if there are not enough cards in the draw pile)."); break;
            case 8: tooltip += _("At the end of your turn, either switch the direction of play OR choose which opponent plays next."); break;
            case 9: tooltip += _("Randomly pick a Cow card from each opponent’s hand and discard it without looking at it. Your opponents must play with one less card until the end of the round."); break;
            case 10: tooltip += `<strong>${_("EXCEPTIONALLY, THIS CARD IS PLAYED WHEN CALCULATING THE SCORE FOR THE ROUND:")}</strong> ${_("Pick a cow category (for example, «flankers»). Ignore all flies in that category when scoring.")}`; break;
        }
        return tooltip;
    }

    public setupNewCard(game: any, card_div: HTMLDivElement, card_type_id: number) {
        game.addTooltipHtml( card_div.id, this.getTooltip(card_type_id));
    }
}










