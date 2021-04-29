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

    public getTooltip(cardTypeId: number) { // TODO
        let tooltip = '';
        switch( cardTypeId ) {
            case 1: tooltip += _("Le joueur suivant ne peut pas jouer de carte Vache Spéciale !"); break;
            case 2: tooltip += _("Prenez connaissance des cartes de l’adversaire de votre choix."); break;
            case 3: tooltip += _("Piochez une carte dans la main d’un adversaire et rendez-lui la carte de votre choix (vous pouvez lui rendre la carte piochée)."); break;
            case 4: tooltip += _("Passez votre tour."); break;
            case 5: tooltip += _("Défaussez le troupeau en cours. Personne ne l’accueille dans son étable. Commencez un nouveau troupeau."); break;
            case 6: tooltip += _("Piochez 2 cartes Fermier"); break;
            case 7: tooltip += _("Défaussez de votre main les vaches de valeur 7, 8 et 9. Remplacez-les par autant de cartes de la pioche. (action impossible s’il ne reste pas assez de cartes dans la pioche)."); break;
            case 8: tooltip += _("A la fin de votre tour, changez le sens du jeu OU passez la main à l’adversaire de votre choix"); break;
            case 9: tooltip += _("Piochez une carte Vache au hasard dans la main de chaque adversaire et défaussez-la sans en prendre connaissance."); break;
            case 10: tooltip += _("EXCEPTION, CETTE CARTE SE JOUE AU MOMENT DU CALCUL DU SCORE DE LA MANCHE : choisissez une catégorie de vache. Vous ne totalisez pas les mouches de cette catégorie de vaches."); break;
        }
        return tooltip;
    }

    public setupNewCard(game: any, card_div: HTMLDivElement, card_type_id: number) {
        game.addTooltipHtml( card_div.id, this.getTooltip(card_type_id));
    }
}










