/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * mow implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * mow.ts
 *
 * mow user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Typescript language.
 *
 */

/**
 * JS const
 */

declare const define;
declare const ebg;
declare const $;
//declare const doj: Dojoo;

class Mow implements Game {

    private gamedatas: MowGamedatas;
    private playerHand: Stock = null;
    private playerFarmerHand: Stock = null;
    private theHerd: MowHerdStock = null;
    private allowedCardsIds: number[];
    private player_id: string;

    private cardwidth: number = 121;
    private cardheight: number = 178;
    private players: { [playerId: number]: Player };
    private playerNumber: number;
    private playersSelectable: boolean = false;
    private selectedPlayerId: number | null = null;
    
    private colors = [
        'forestgreen',
        'goldenrod',
        'lightsalmon',
        'crimson',
        null,
        'teal'
    ];

    private remainingCardsColors = [
        '#FF0000',
        '#FF3300',
        '#ff6600',
        '#ff9900',
        '#FFCC00',
        '#FFFF00'
    ];

    private mowCards = new MowCards();
    private farmerCards = new FarmerCards();

    constructor() {}
        
    /*
        setup:
        
        This method must set up the game user interface according to current game situation specified
        in parameters.
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    
   public setup(gamedatas: MowGamedatas) {
        //console.log( "Starting game setup" );

        // Place payer zone
        this.players = gamedatas.players;
        this.playerNumber = Object.keys(this.players).length;

        const ids: string[] = Object.keys(this.players);
        let playerId: string = gamedatas.current_player_id;
        if (!ids.includes(playerId)) {
            playerId = ids[0];
        }

        const bottomPlayers = this.playerNumber === 5 ? 2 : 1;
        
        for(let i = 1; i <= this.playerNumber; i++) {
            const player: Player = this.players[playerId];
            dojo.place((this as any).format_block( 'jstpl_playertable', {
                player_id: playerId,
                player_color: player.color,
                player_name: (player.name.length > 10 ? `${player.name.substr(0,10)}...` : player.name)
            } ), i > bottomPlayers ? 'toprowplayers' : 'bottomrowplayers');

            playerId = gamedatas.next_players_id[playerId];
        }
        
        if (Object.keys(gamedatas.players).length == 2) {
            dojo.style( 'direction-text', 'display', 'none' );
        }
        
        // Set up your game interface here, according to "gamedatas"
        this.playerHand = new ebg.stock() as Stock;
        this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
        this.playerHand.setSelectionMode(1);            
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );

        this.theHerd = new ebg.stock() as MowHerdStock;
        this.theHerd.create( this, $('theherd'), this.cardwidth, this.cardheight );
        this.theHerd.setSelectionMode(0);            
        this.theHerd.centerItems = true;
        this.theHerd.acrobatic_overlap = 48;
        this.theHerd.updateDisplay = (from: string) => updateDisplay.apply(this.theHerd, [from]);
        this.theHerd.isAcrobatic = (stockItemId: number) => isAcrobatic.apply(this.theHerd, [stockItemId]);

        this.mowCards.createCards([this.theHerd, this.playerHand]);

        this.playerFarmerHand = new ebg.stock() as Stock;
        this.playerFarmerHand.create( this, $('myfarmers'), this.cardwidth, this.cardheight );
        this.playerFarmerHand.setSelectionMode(1);            
        this.playerFarmerHand.setSelectionAppearance('class');    
        this.playerFarmerHand.selectionClass = 'no-visible-selection';        
        this.playerFarmerHand.centerItems = true;
        this.playerFarmerHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.farmerCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect( this.playerFarmerHand, 'onChangeSelection', this, 'onPlayerFarmerHandSelectionChanged' );
        this.playerFarmerHand.image_items_per_row = 1;
        this.farmerCards.createCards([this.playerFarmerHand]);
        
        //console.log('this.gamedatas', this.gamedatas);
        
        // Cards in player's hand
        this.gamedatas.hand.forEach((card: Card) => this.addCardToHand(card));
        this.gamedatas.farmerHand.forEach((card: FarmerCard) => this.addFarmerCardToHand(card));
        
        // Cards played on table
        this.gamedatas.herd.forEach((card: Card) => {
            const cardUniqueId = this.mowCards.getCardUniqueId(card.type, card.number);
            if (card.slowpokeNumber) {
                this.setSlowpokeWeight(cardUniqueId, card.slowpokeNumber);
            }            
            this.addCardToHerd(card);
        });

        this.setRemainingCards(this.gamedatas.remainingCards);
        this.enableAllowedCards(this.gamedatas.allowedCardsIds);
        if (!this.gamedatas.direction_clockwise) {
            dojo.addClass('direction-play-symbol', 'direction-anticlockwise');
        }

        dojo.connect( $('keepDirectionButton'), 'onclick', this, 'onKeepDirection' );
        dojo.connect( $('changeDirectionButton'), 'onclick', this, 'onChangeDirection' );

        
        Object.keys(gamedatas.players).forEach(playerId => dojo.connect($(`playertable-${playerId}`), 'onclick', this, 'onPlayerSelection'));

        // Setup game notifications to handle (see "setupNotifications" method below)
        //console.log('setupNotifications');
        this.setupNotifications();

        //console.log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states
    
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        //console.log( 'Entering state: '+stateName );
        
        switch( stateName ) {            
            case 'playerTurn':
                const suffix = args.args.suffix;
                this.setGamestateDescription(suffix);
                this.onEnteringStatePlayerTurn(args);                    
                break;

            case 'chooseDirection':    
                this.onEnteringStateChooseDirection(args.args);     
                break;


            case 'swapHands':  
                this.onEnteringStateSwapHands();
                break;
        }
    }

    private onEnteringStatePlayerTurn(args: { active_player: string | number }) {
        dojo.addClass(`playertable-${args.active_player}`, "active");
        if((this as any).isCurrentPlayerActive() && this.playerHand.getSelectedItems().length === 1) {
            const selectedCardId = this.playerHand.getSelectedItems()[0].id;
            if (this.allowedCardsIds?.indexOf(Number(selectedCardId)) !== -1) {

                setTimeout(() => {
                    if ((this as any).isInterfaceLocked()) {
                        this.playerHand.unselectAll();
                    } else {
                        this.onPlayerHandSelectionChanged();
                    }
                }, 250);
            }
        }
    }

    private onEnteringStateChooseDirection(args: { direction_clockwise: boolean, canPick: boolean }) {
        if ((this as any).isCurrentPlayerActive()) {
            dojo.toggleClass('keepDirectionSymbol', 'direction-anticlockwise', !args.direction_clockwise);
            dojo.toggleClass('changeDirectionSymbol', 'direction-anticlockwise', args.direction_clockwise);

            const keepDirectionNextPlayer = args.direction_clockwise ? this.getPreviousPlayer() : this.getNextPlayer();
            const changeDirectionNextPlayer = args.direction_clockwise ? this.getNextPlayer() : this.getPreviousPlayer();

            this.setPick(args.canPick);

            $("keepDirectionNextPlayer").innerHTML = keepDirectionNextPlayer.name;
            $("changeDirectionNextPlayer").innerHTML = changeDirectionNextPlayer.name;
            dojo.style( 'keepDirectionNextPlayer', 'color', '#'+keepDirectionNextPlayer.color );
            dojo.style( 'changeDirectionNextPlayer', 'color', '#'+changeDirectionNextPlayer.color );

            dojo.style( 'direction_popin', 'display', 'flex' );
            dojo.toggleClass('direction_popin', 'swap', !args.direction_clockwise);
            
        }
    }

    private onEnteringStateSwapHands() {
        if ((this as any).isCurrentPlayerActive()) {
            this.playersSelectable = true;  
            Object.keys(this.gamedatas.players).filter(playerId => Number(playerId) !== Number((this as any).player_id)).forEach(playerId => 
                dojo.addClass(`playertable-${playerId}`, 'selectable')
            );            
            // update selectedPlayerId on click and add Swap button
        }
    }

    private setGamestateDescription(suffix: string = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + suffix]}`; 
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + suffix]}`; 
        (this as any).updatePageTitle();        
    }

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    public onLeavingState(stateName: string) {
        //console.log( 'Leaving state: '+stateName );
        
        switch( stateName ) {
        
            case 'playerTurn':  
                dojo.query(".playertable").removeClass("active");           
                break;

            case 'chooseDirection':    
                dojo.style( 'direction_popin', 'display', 'none' );
                break;   

            case 'swapHands':  
                this.playersSelectable = false;    
                Object.keys(this.gamedatas.players).forEach(playerId => 
                    dojo.removeClass(`playertable-${playerId}`, 'selectable')
                ); 
                break;   
        
            case 'dummmy':
                break;
        }               
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //        
    public onUpdateActionButtons(stateName: string, args: { canCollect: boolean }) {
        //console.log( 'onUpdateActionButtons: '+stateName );
        (this as any).removeActionButtons();
                    
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                if (args.canCollect) {
                    (this as any).addActionButton( 'collectHerd_button', _('Collect herd'), 'onCollectHerd', null, false, 'red');
                }
                break;
                case 'swapHands':
                    (this as any).addActionButton( 'dontSwapHands_button', _(`Don't swap`), 'onDontSwap');
                break;
            }
        }
    }       

    ///////////////////////////////////////////////////
    //// Utility methods
    
    /*
    
        Here, you can defines some utility methods that you can use everywhere in your javascript
        script.
    
    */
    
    private setSlowpokeWeight(slowpokeId: number, slowpokeNumber: number) {
        const keys = Object.keys(this.theHerd.item_type).filter((key) => (key as any as number) % 100 == slowpokeNumber);
        const lastKey = keys[keys.length-1];
        let lastKeyItemWeight = this.theHerd.item_type[lastKey].weight;
        this.theHerd.item_type[slowpokeId].weight = lastKeyItemWeight + 1;
    }

    private playCardOnTable(playerId: string, card: Partial<Card>, slowpokeNumber: number) {
        if (slowpokeNumber != -1) {
            this.setSlowpokeWeight(this.mowCards.getCardUniqueId(card.type, card.number), slowpokeNumber);
        }
            
        if( playerId != this.player_id ) {
            // Some opponent played a card
            // Move card from player panel
            this.addCardToHerd(card, 'playertable-'+playerId);
        } else {
            // You played a card. Move card from the hand and remove corresponding item
            this.addCardToHerd(card, 'myhand_item_'+card.id);
            this.playerHand.removeFromStockById(''+card.id);
        }

    }
    
    private setPick(canPick: boolean) {
        dojo.toggleClass('pickBlock', 'visible', canPick);
        
        document.getElementById('pickBlock').innerHTML = '';

        if (canPick) {
            const ids: number[] = this.gamedatas.playerorder.map(id => Number(id));

            let html = '';
            ids.forEach(id => {
                const player = this.gamedatas.players[id];
                html += `<button id="pickBtn${id}" class="bgabutton bgabutton_blue pickButton" style="border: 3px solid #${player.color}">${player.name}</button>`;
            });

            document.getElementById('pickBlock').innerHTML = html;

            ids.forEach(id => document.getElementById(`pickBtn${id}`).addEventListener('click', () => this.pickPlayer(id)));
        }
    }
    
    ///////////////////////////////////////////////////
    //// Player's action
    
    /*
    
        Here, you are defining methods to handle player's action (ex: results of mouse click on 
        game objects).
        
        Most of the time, these methods:
        _ check the action is possible at this game state.
        _ make a call to the game server
    
    */    

   public onPlayerSelection(event: MouseEvent) {
        if (!this.playersSelectable) {
            return;
        }

        const playerId = Number((event.target as HTMLDivElement).dataset.id);

        if (playerId === (this as any).player_id) {
            return;
        }

        if (this.selectedPlayerId) {
            dojo.removeClass(`playertable-${this.selectedPlayerId}`, 'selected');
        } else {
            // first selection, we add Swap button
            (this as any).addActionButton( 'swapHands_button', _(`Swap`), 'onSwap');
        }

        this.selectedPlayerId = playerId;
        dojo.addClass(`playertable-${playerId}`, 'selected');
    }
    

   public onCollectHerd() {
        if(!(this as any).checkAction('collectHerd'))
        return;
    
        this.takeAction("collectHerd");
    }

    public onKeepDirection() {
        if(!(this as any).checkAction('setDirection'))
        return;
        this.takeAction("setDirection", {
            change: false
        });
    }

    public onChangeDirection() {
        if(!(this as any).checkAction('setDirection'))
        return;
        this.takeAction("setDirection", {
            change: true
        });
    }

    public pickPlayer(id: number) {
        if(!(this as any).checkAction('setPlayer'))
        return;
        this.takeAction("setPlayer", {
            id
        });
    }

    public onSwap() {
         if(!(this as any).checkAction('swap'))
         return;
     
         this.takeAction("swap", {
            playerId: this.selectedPlayerId
        });
        
        this.selectedPlayerId = null;
    }

    public onDontSwap() {
         if(!(this as any).checkAction('dontSwap'))
         return;
     
         this.takeAction("swap", {
            playerId: 0
        });
    }
    
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your mow.game.php file.
    
    */
   public setupNotifications() {
        //console.log( 'notifications subscriptions setup' );
        
        dojo.subscribe( 'newHand', this, "notif_newHand" );
        dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );   
        dojo.subscribe( 'farmerCardPlayed', this, "notif_farmerCardPlayed" );         
        dojo.subscribe( 'newCard', this, "notif_newCard" );         
        dojo.subscribe( 'newFarmerCard', this, "notif_newFarmerCard" );
        dojo.subscribe( 'allowedCards', this, "notif_allowedCards" );  
        dojo.subscribe( 'directionChanged', this, "notif_directionChanged" );
        dojo.subscribe( 'herdCollected', this, "notif_herdCollected" );
        dojo.subscribe( 'handCollected', this, "notif_handCollected" );
        dojo.subscribe( 'allTopFlies', this, "notif_allTopFlies" );

        (this as any).notifqueue.setSynchronous( 'herdCollected', 2000 );
        (this as any).notifqueue.setSynchronous( 'handCollected', 1500 );
    }
    
    // from this point and below, you can write your game notifications handling methods
    
    public notif_newHand( notif: Notif<NotifNewHandArgs> ) {
        //console.log( 'notif_newHand', notif );

        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();

        notif.args.cards.forEach((card: Card) => this.addCardToHand(card));

        if (notif.args.remainingCards) {
            this.setRemainingCards(notif.args.remainingCards);         
        }
    }
    
    public notif_cardPlayed( notif: Notif<NotifCardPlayedArgs> ) {
        //console.log( 'notif_cardPlayed', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        
        this.playCardOnTable(notif.args.player_id, {
            id: notif.args.card_id,
            type: notif.args.color,
            number: notif.args.number
        }, notif.args.slowpokeNumber);

        this.setRemainingCards(notif.args.remainingCards);
    }

    public notif_farmerCardPlayed( notif: Notif<NotifFarmerCardPlayedArgs> ) {
        this.playerFarmerHand.removeFromStockById(''+notif.args.card.id);
    }
    
    public notif_allowedCards( notif: Notif<NotifAllowedCardsArgs> ) {
        // console.log( 'notif_allowedCards', notif );            
        this.enableAllowedCards(notif.args.allowedCardsIds);
    }
    
    public notif_newCard( notif: Notif<NotifNewCardArgs> ) {
        //console.log( 'notif_newCard', notif );

        const card = notif.args.card;
        setTimeout(() => {
            // timeout so new card appear after played card animation
            this.addCardToHand(card, 'remainingCards');
            if (this.allowedCardsIds && this.allowedCardsIds.indexOf(card.id) === -1) {
                dojo.query(`#myhand_item_${card.id}`).addClass("disabled");
            }
        }, 1000);
        
    }
    
    public notif_newFarmerCard( notif: Notif<NotifNewFarmerCardArgs> ) {
        //console.log( 'notif_newCard', notif );

        const card = notif.args.card;
        this.addFarmerCardToHand(card);        
    }
    
    public notif_directionChanged( notif: Notif<DirectionChangedArgs> ) {
        //console.log( 'notif_directionChanged', notif );

        dojo.toggleClass('direction-play-symbol', 'direction-anticlockwise', !notif.args.direction_clockwise);

        dojo.removeClass("direction-animation-symbol");
        dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
    }
    
    public notif_herdCollected( notif: Notif<NotifHerdCollectedArgs> ) {
        //console.log( 'notif_herdCollected', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        
        (this as any).scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
        this.theHerd.removeAllTo( 'player_board_'+notif.args.player_id );
        dojo.query("#myhand .stockitem").removeClass("disabled");
        this.allowedCardsIds = null; 
        this.playerHand.unselectAll();
    }
    
    public notif_handCollected( notif: Notif<NotifHandCollectedArgs> ) {
        // console.log( 'notif_handCollected', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        if (this.player_id == notif.args.player_id) {
            dojo.query("#myhand").removeClass("bounce");
            dojo.query("#myhand").addClass("bounce");
        }
        
        (this as any).scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
    }
    
    public notif_allTopFlies( notif: Notif<NotifAllTopFliesArgs> ) {
        (this as any).scoreCtrl[notif.args.playerId].toValue(notif.args.points);
    }

    ////////////////////////////////
    ////////////////////////////////
    /////    Cards selection    ////
    ////////////////////////////////
    ////////////////////////////////
    public onPlayerHandSelectionChanged() {            
        const items = this.playerHand.getSelectedItems();
        if (items.length == 1) {
            if ((this as any).checkAction('playCard', true)) {
                // Can play a card
                const id = items[0].id;

                this.takeAction("playCard", { 
                    id
                });
                
                this.playerHand.unselectAll();
            }
        }
    }

    public onPlayerFarmerHandSelectionChanged() {            
        const items = this.playerFarmerHand.getSelectedItems();
        if (items.length == 1) {
            if ((this as any).checkAction('playFarmer', true)) {
                // Can play a card
                const id = items[0].id;

                this.takeAction("playFarmer", { 
                    id
                });
                
                this.playerFarmerHand.unselectAll();
            }
        }
    }

    ////////////////////////////////
    ////////////////////////////////
    /////////    Utils    //////////
    ////////////////////////////////
    ////////////////////////////////
    
    private takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/mow/mow/${action}.html`, data, this, () => {});
    }

    private setRemainingCards(remainingCards: number) {
        let $remainingCards = $('remainingCards');
        $remainingCards.innerHTML = remainingCards;
        dojo.style($remainingCards, "color", remainingCards > 5 ? null : this.remainingCardsColors[remainingCards]);
    }

    private enableAllowedCards(allowedCardsIds: number[]) {
        this.allowedCardsIds = allowedCardsIds;
        this.playerHand.items.map(item => Number(item.id)).forEach((id: number) => {
            try {
                const disallowed = allowedCardsIds.indexOf(id) === -1;
                dojo.toggleClass('myhand_item_' + id, 'disabled', disallowed);
                if (disallowed) {
                    this.playerHand.unselectItem(''+id);
                }
            } catch(e) {}
        })
        
    }
    
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.displayedColor !== undefined) {
                    args.displayedColor = this.colors[Number(args.displayedColor)];
                    args.displayedNumber = dojo.string.substitute("<strong style='color: ${displayedColor}'>${displayedNumber}</strong>", {'displayedColor' : args.displayedColor, 'displayedNumber' : args.displayedNumber});
                }
                // symbol for special cards
                if (args.precision && args.precision !== '') {
                    if (args.precision === 'slowpoke') {
                        args.precision = '<span class="log-arrow rotate270"></span><span class="log-arrow rotate90"></span>';
                    } else if (args.precision === 'acrobatic') {
                        args.precision = '<span class="log-arrow rotate180"></span>';
                    }
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }

    private getNextPlayer() {
        const activePlayerId = (this as any).getActivePlayerId();
        const activePlayerIndex = this.gamedatas.playerorder.findIndex(playerId => ''+playerId === activePlayerId);
        const nextPlayerIndex = activePlayerIndex >= this.gamedatas.playerorder.length-1 ? 0 : activePlayerIndex+1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[nextPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[nextPlayerIndex])];
    }

    private getPreviousPlayer() {
        const activePlayerId = (this as any).getActivePlayerId();
        const activePlayerIndex = this.gamedatas.playerorder.findIndex(playerId => ''+playerId === activePlayerId);
        const previousPlayerIndex = activePlayerIndex === 0 ? this.gamedatas.playerorder.length-1 : activePlayerIndex-1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[previousPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[previousPlayerIndex])];
    }

    private addCardToStock(stock: Stock, card: Partial<Card>, from?: string) {
        stock.addToStockWithId(this.mowCards.getCardUniqueId(card.type, card.number), ''+card.id, from);
    }

    private addCardToHand(card: Partial<Card>, from?: string) {
        this.addCardToStock(this.playerHand, card, from);
    }

    private addCardToHerd(card: Partial<Card>, from?: string) {
        this.addCardToStock(this.theHerd, card, from);
    }

    private addFarmerCardToStock(stock: Stock, card: Partial<FarmerCard>, from?: string) {
        stock.addToStockWithId(card.type, ''+card.id, from);
    }

    private addFarmerCardToHand(card: Partial<FarmerCard>, from?: string) {
        this.addFarmerCardToStock(this.playerFarmerHand, card, from);
    }
}