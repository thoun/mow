const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

/**
 * JS const
 */

declare const define;
declare const ebg;
declare const $;
//declare const dojo: Dojo;

type PickCardAction = 'play' | 'give';

class Mow implements Game {
    private cardCounters: Counter[] = [];
    private farmerCardCounters: Counter[] = [];

    private gamedatas: MowGamedatas;
    private playerHand: Stock = null;
    private playerFarmerHand: Stock = null;
    private theHerds: MowHerdStock[] = [];
    private allowedCardsIds: number[];
    private player_id: string;

    private cardwidth: number = 121;
    private cardheight: number = 188;
    private players: { [playerId: number]: Player };
    private playerNumber: number;
    private playersSelectable: boolean = false;
    private selectedPlayerId: number | null = null;
    private pickCardAction: PickCardAction = 'play';
    
    private colors = [
        '#b5b5b5',
        '#a4d6e3',
        '#e98023',
        '#0096d9',
        null,
        '#000000'
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
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.createPlayerPanels(gamedatas); 

        // Place payer zone
        this.players = gamedatas.players;
        this.playerNumber = Object.keys(this.players).length;

        const ids: string[] = Object.keys(this.players);
        let playerId: string = gamedatas.current_player_id;
        if (!ids.includes(playerId)) {
            playerId = ids[0];
        }

        const isTwoPlayers = Object.keys(gamedatas.players).length == 2;

        const bottomPlayers = this.playerNumber === 5 ? 2 : 1;

        let alreadyPlacedOneTop = false;
        let alreadyPlacedOneBottom = false;
        
        for(let i = 1; i <= this.playerNumber; i++) {
            const player: Player = this.players[playerId];
            const html = `<div id="playertable-${playerId}" class="playertable" data-id="${playerId}">
              <div class="playertablename" style="color:#${player.color}" data-id="${playerId}" title="${player.name}">
                ${(player.name.length > 10 ? `${player.name.substr(0,10)}...` : player.name)}
              </div>
            </div>`;
            const row = i > bottomPlayers ? 'toprowplayers' : 'bottomrowplayers';

            if (alreadyPlacedOneTop && i > bottomPlayers ) {
                dojo.place(`<div class="between-players-arrow top ${this.gamedatas.direction_clockwise ? '' : 'direction-anticlockwise'}"></div>`, row);
            }
            if (alreadyPlacedOneBottom && i <= bottomPlayers) {
                dojo.place(`<div class="between-players-arrow bottom ${this.gamedatas.direction_clockwise ? '' : 'direction-anticlockwise'}"></div>`, row);
            }

            dojo.place(html, row);

            playerId = gamedatas.next_players_id[playerId];
            
            if (!isTwoPlayers) {
                if (i > bottomPlayers) {
                    alreadyPlacedOneTop = true;
                } else {
                    alreadyPlacedOneBottom = true;
                }
            }
        }
        
        if (isTwoPlayers) {
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

        for (let iHerd=0; iHerd<gamedatas.herdNumber; iHerd++) {
            if (iHerd > 0) {
                dojo.place(`<hr/>`, 'theherds');
            }

            dojo.place(`<div class="row">${gamedatas.herdNumber > 1 ? `<div id="rowIndicatorWrapper${iHerd}" class="rowIndicatorWrapper"></div>` : ''}<div id="herd${iHerd}" class="herd"></div></div>`, 'theherds');
            this.theHerds[iHerd] = new ebg.stock() as MowHerdStock;
            this.theHerds[iHerd].create( this, $(`herd${iHerd}`), this.cardwidth, this.cardheight );
            this.theHerds[iHerd].setSelectionMode(0);            
            this.theHerds[iHerd].centerItems = true;
            this.theHerds[iHerd].onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
            this.theHerds[iHerd].acrobatic_overlap = 45;
            this.theHerds[iHerd].updateDisplay = (from: string) => updateDisplay.apply(this.theHerds[iHerd], [from]);
            this.theHerds[iHerd].isAcrobatic = (stockItemId: number) => isAcrobatic.apply(this.theHerds[iHerd], [stockItemId]);
        }

        this.mowCards.createCards([...this.theHerds, this.playerHand]);

        this.playerFarmerHand = new ebg.stock() as Stock;
        this.playerFarmerHand.create( this, $('myfarmers'), this.cardwidth, this.cardheight );
        this.playerFarmerHand.setSelectionMode(1);            
        this.playerFarmerHand.setSelectionAppearance('class');    
        this.playerFarmerHand.selectionClass = 'no-visible-selection';        
        this.playerFarmerHand.centerItems = true;
        this.playerFarmerHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.farmerCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect( this.playerFarmerHand, 'onChangeSelection', this, 'onPlayerFarmerHandSelectionChanged' );
        this.farmerCards.createCards([this.playerFarmerHand]);

        if (this.isSimpleVersion()) {
           dojo.style(('myfarmers'), "display", "none");        
        }
        
        // Cards in player's hand
        this.gamedatas.hand.forEach((card: Card) => this.addCardToHand(card));
        this.gamedatas.farmerHand.forEach((card: FarmerCard) => this.addFarmerCardToHand(card));
        
        // Cards played on table
        for (let iHerd=0; iHerd<gamedatas.herdNumber; iHerd++) {
            this.gamedatas.herds[iHerd].forEach((card: Card) => {
                const cardUniqueId = this.mowCards.getCardUniqueId(card.type, card.number);
                if (card.slowpokeNumber) {
                    this.setSlowpokeWeight(cardUniqueId, card.slowpokeNumber);
                }            
                this.addCardToHerd(card, iHerd);
            });
        }

        this.setRemainingCards(this.gamedatas.remainingCards);
        if (this.gamedatas.herdNumber == 1) {
            this.enableAllowedCards(this.gamedatas.allowedCardsIds);
        }
        if (!this.gamedatas.direction_clockwise) {
            dojo.addClass('direction-play-symbol', 'direction-anticlockwise');
        }

        dojo.connect( $('keepDirectionButton'), 'onclick', this, 'onKeepDirection' );
        dojo.connect( $('changeDirectionButton'), 'onclick', this, 'onChangeDirection' );

        
        Object.keys(gamedatas.players).forEach(playerId => dojo.connect($(`playertable-${playerId}`), 'onclick', this, 'onPlayerSelection'));

        if (gamedatas.herdNumber > 1) {
            dojo.place(`<div id="rowIndicator"><div id="rowIndicatorBackground" class="${!this.gamedatas.direction_clockwise ? 'inverse' : ''}"></div></div>`, `rowIndicatorWrapper${gamedatas.activeRow}`);
        }

        // Setup game notifications to handle (see "setupNotifications" method below)
        log('setupNotifications');
        this.setupNotifications();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states
    
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log( 'Entering state: '+stateName, args);
        
        if((this as any).isCurrentPlayerActive()) {
            dojo.addClass(`playertable-${args.active_player}`, "active");
        }

        switch( stateName ) {
            case 'newHand':
                Object.keys(this.gamedatas.players).forEach(playerId => this.cardCounters[playerId].toValue(5));
                break;
            case 'playerTurn':
                const suffix = args.args.suffix;
                this.setGamestateDescription(suffix);
                this.onEnteringStatePlayerTurn(args);  
                if((this as any).isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCards.map(card => card.id));   
                }
                break;

            case 'chooseDirection':    
                this.onEnteringStateChooseDirection(args.args);     
                break;
            case 'playFarmer':
                if((this as any).isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCards.map(card => card.id));   
                }
                break;

            case 'swapHands':  
                this.onEnteringSelectionAction();
                if((this as any).isCurrentPlayerActive() && args.args.opponentId) {
                    this.selectPlayer(args.args.opponentId);
                }
                break;
            case 'selectOpponent':
                this.onEnteringSelectionAction();
                break;
            case 'viewCards':
                this.onEnteringViewCards(args.args, (this as any).isCurrentPlayerActive());
                break;
            case 'giveCard':                
                if((this as any).isCurrentPlayerActive()) {
                    this.setPickCardAction('give');
                }
                break;
            case 'endHand':
                for (let iHerd=0; iHerd<this.gamedatas.herdNumber; iHerd++) {
                    this.theHerds[iHerd].removeAllTo('topbar');
                }
                break;
        }
    }

    private onEnteringStatePlayerTurn(args: { active_player: string | number, args: { allowedCardIds: number[] } }) {
        if((this as any).isCurrentPlayerActive()) {
            this.setPickCardAction('play');
            this.enableAllowedCards(args.args.allowedCardIds);
        }
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
            const herdSelector = this.gamedatas.herdNumber > 1;
            dojo.toggleClass('keepDirectionSymbol', 'direction-anticlockwise', !args.direction_clockwise);
            dojo.toggleClass('changeDirectionSymbol', 'direction-anticlockwise', args.direction_clockwise);

            this.setPick(args.canPick);

            if (herdSelector) {
                Array.from(document.getElementsByClassName('label-next-player')).forEach((span: HTMLSpanElement) => span.innerHTML = _('Next herd'));

                const downRow = (this.gamedatas.activeRow + 1) % this.gamedatas.herdNumber;
                const upRow = (this.gamedatas.activeRow + this.gamedatas.herdNumber - 1) % this.gamedatas.herdNumber;

                const keepDirectionRow = args.direction_clockwise ? downRow : upRow;
                const changeDirectionRow = args.direction_clockwise ? upRow : downRow;

                $("keepDirectionNextPlayer").innerHTML = dojo.string.substitute(_("Herd ${number}"), {'number' : keepDirectionRow+1 });
                $("changeDirectionNextPlayer").innerHTML = dojo.string.substitute(_("Herd ${number}"), {'number' : changeDirectionRow+1 });

                document.getElementById('keepDirectionSymbol').classList.add('straight');
                document.getElementById('changeDirectionSymbol').classList.add('straight');
                dojo.toggleClass('keepDirectionSymbol', 'reverse-arrow', !args.direction_clockwise);
                dojo.toggleClass('changeDirectionSymbol', 'reverse-arrow', args.direction_clockwise);
            } else {
                const keepDirectionNextPlayer = args.direction_clockwise ? this.getPreviousPlayer() : this.getNextPlayer();
                const changeDirectionNextPlayer = args.direction_clockwise ? this.getNextPlayer() : this.getPreviousPlayer();

                $("keepDirectionNextPlayer").innerHTML = keepDirectionNextPlayer.name;
                $("changeDirectionNextPlayer").innerHTML = changeDirectionNextPlayer.name;
                dojo.style( 'keepDirectionNextPlayer', 'color', '#'+keepDirectionNextPlayer.color );
                dojo.style( 'changeDirectionNextPlayer', 'color', '#'+changeDirectionNextPlayer.color );
            }

            dojo.style( 'direction_popin', 'display', 'flex' );
            dojo.toggleClass('direction_popin', 'swap', !args.direction_clockwise);
            
        }
    }

    private onEnteringSelectionAction() {
        if ((this as any).isCurrentPlayerActive()) {
            this.playersSelectable = true;  
            Object.keys(this.gamedatas.players).filter(playerId => Number(playerId) !== Number((this as any).player_id)).forEach(playerId => 
                dojo.addClass(`playertable-${playerId}`, 'selectable')
            );
        }
    }

    private onEnteringViewCards(args: EnteringLookCardsArgs, isActivePlayer: boolean) {
        const opponent = this.getPlayer(args.opponentId);
        const opponentCardsDiv = document.getElementById('opponent-animals');
        opponentCardsDiv.innerHTML = '';
        document.getElementById('opponent-hand-label').innerHTML = dojo.string.substitute(_("${player_name} cards"), { player_name: `<span style="color: #${opponent.color}">${opponent.name}</span>` });
        
        const opponentHandWrap = document.getElementById('opponent-hand-wrap');
        opponentHandWrap.classList.remove('hidden');
        opponentHandWrap.style.boxShadow = `0 0 3px 3px #${opponent.color}`;
        
        opponentCardsDiv.classList.toggle('text', !isActivePlayer);
        if (isActivePlayer) {
            const opponentHand = new ebg.stock() as Stock;
            opponentHand.create( this, $('opponent-animals'), this.cardwidth, this.cardheight);
            opponentHand.setSelectionMode(0);
            opponentHand.centerItems = true;
            opponentHand.onItemCreate = (cardDiv: HTMLDivElement, type: number) => this.mowCards.setupNewCard(this, cardDiv, type);
            this.mowCards.createCards([opponentHand]);
            args.cards.forEach(card=> this.addCardToStock(opponentHand, card));
        } else {
            const active = this.getPlayer(Number((this as any).getActivePlayerId()));
            document.getElementById('opponent-animals').innerHTML = '<div>' + dojo.string.substitute(_("${active_player_name} is looking at ${player_name} cards"), { 
                active_player_name: `<span style="color: #${active.color}">${active.name}</span>`,
                player_name: `<span style="color: #${opponent.color}">${opponent.name}</span>` 
            }) + '</div>';
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
        log( 'Leaving state: '+stateName ); 
        dojo.query(".playertable").removeClass("active");   
        
        switch( stateName ) {
        
            case 'playerTurn':                 
                if((this as any).isCurrentPlayerActive()) {
                    this.enableFarmerCards();
                    if (this.gamedatas.herdNumber > 1) {
                        this.resetAllowedCards();
                    }
                }               
                break;

            case 'chooseDirection':    
                dojo.style( 'direction_popin', 'display', 'none' );
                break;   
        
            case 'playFarmer':                 
                if((this as any).isCurrentPlayerActive()) {
                    this.enableFarmerCards();   
                }               
                break;

            case 'swapHands':  
            case 'selectOpponent':
                this.onLeavingSelectionAction(); 
                break;  
            case 'viewCards':
                this.onLeavingStateViewCards(); 
        }               
    }

    private onLeavingSelectionAction() {
        this.playersSelectable = false;    
        Object.keys(this.gamedatas.players).forEach(playerId => 
            dojo.removeClass(`playertable-${playerId}`, 'selectable')
        );
    }

    onLeavingStateViewCards() {
        const giraffeHandWrap = document.getElementById('opponent-hand-wrap');
        giraffeHandWrap.classList.add('hidden');
        giraffeHandWrap.style.boxShadow = '';
        document.getElementById('opponent-animals').innerHTML = '';
    }

    private addAllowedFarmerCardsButtons(args: any) {
        args.allowedFarmerCards.forEach(card => 
            (this as any).addActionButton(`playFarmer${card.id}_button`, _('Play farmer') + ` <div class="farmer-icon farmer${card.type}"></div>`, () => this.playFarmer(card.id), null, null, 'gray')
        );
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //        
    public onUpdateActionButtons(stateName: string, args: any) {
        //log( 'onUpdateActionButtons: '+stateName );
        (this as any).removeActionButtons();
                    
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                    this.addAllowedFarmerCardsButtons(args);
                    if (args.canCollect) {
                        (this as any).addActionButton( 'collectHerd_button', _('Collect herd'), 'onCollectHerd', null, false, 'red');
                    }
                    break;
                case 'playFarmer':
                    this.addAllowedFarmerCardsButtons(args);
                    (this as any).addActionButton('pass_button', _('Pass'), 'onPassFarmer');
                    break;
                case 'swapHands':
                    (this as any).addActionButton( 'dontSwapHands_button', _(`Don't swap`), 'onDontSwap');
                    (this as any).addActionButton( 'selectionAction_button', _(`Swap`), 'onSwap');
                    dojo.addClass('selectionAction_button', 'disabled');
                    break;                
                case 'selectOpponent':
                    if (args.lookOpponentHand) {
                        (this as any).addActionButton( 'selectionAction_button', _(`Look player's hand`), 'onLookHand');
                    } else {
                        (this as any).addActionButton( 'selectionAction_button', _(`Pick a card`), 'onPickOpponentCard');
                    }
                    dojo.addClass('selectionAction_button', 'disabled');
                    break;
                case 'selectFliesType':
                    const selectFliesTypeArgs = args as EnteringSelectFliesTypeArgs;
                    [1, 2, 3, 5].forEach(type => 
                        (this as any).addActionButton(`flyType${type}_button`, this.getSelectFlyTypeDetailsLabel(type, selectFliesTypeArgs), () => this.selectFlieType(type), null, null, selectFliesTypeArgs.counts[type].points ? undefined : 'gray')
                    );
                    (this as any).addActionButton( 'flyTypeIgnore_button', _(`Ignore`), () => this.selectFlieType(0), null, false, 'red');
                    break;
                case 'viewCards':
                    (this as any).addActionButton('seen-button', _('Seen'), () => this.next());
                    break;
            }
        }
    }
    
    private getSelectFlyTypeDetailsLabel(type: number, selectFliesTypeArgs: EnteringSelectFliesTypeArgs): string {
        const details: SelectFliesTypeCount = selectFliesTypeArgs.counts[type];
        return (type > 1 ? _('${number}-flies cards').replace('${number}', type) : _('1-fly cards')) + ' (' + _('ignore ${points} point(s)')/*.replace('${number}', details.number)*/.replace('${points}', details.points) + ')';
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    
    /*
    
        Here, you can defines some utility methods that you can use everywhere in your javascript
        script.
    
    */

    private isSimpleVersion(): boolean {
        return this.gamedatas.simpleVersion;
    }

    private getPlayer(playerId: number): Player {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private createPlayerPanels(gamedatas: MowGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);

            let html = `<div class="counters">
                <div id="card-counter-wrapper-${player.id}" class="counter">
                    <div class="counter-icon card"></div>
                    <div class="player-hand-card"></div> 
                    <span id="card-counter-${player.id}"></span>
                </div>`;
            if (!gamedatas.simpleVersion) {
                html += `
                    <div id="farmer-card-counter-wrapper-${player.id}" class="counter">
                        <div class="counter-icon farmer-card"></div>
                        <div class="player-hand-card"></div> 
                        <span id="farmer-card-counter-${player.id}"></span>
                    </div>`;
            }
            html += `</div>`;

            dojo.place(html, `player_board_${player.id}`);

            const cardCounter = new ebg.counter();
            cardCounter.create(`card-counter-${playerId}`);
            cardCounter.setValue(player.cards);
            this.cardCounters[playerId] = cardCounter;

            (this as any).addTooltipHtml(`card-counter-wrapper-${player.id}`, _("Number of cards in hand"));

            
            if (!gamedatas.simpleVersion) {
                const farmerCardCounter = new ebg.counter();
                farmerCardCounter.create(`farmer-card-counter-${playerId}`);
                farmerCardCounter.setValue(player.farmerCards);
                this.farmerCardCounters[playerId] = farmerCardCounter;

                (this as any).addTooltipHtml(`farmer-card-counter-wrapper-${player.id}`, _("Number of farmer cards in hand"));
            }

            
        });
    }

    private setPickCardAction(pickCardAction: PickCardAction) {
        if (this.pickCardAction == pickCardAction) {
            return;
        }

        this.playerHand.unselectAll();
        this.pickCardAction = pickCardAction;
    }
    
    private setSlowpokeWeight(slowpokeId: number, slowpokeNumber: number) {
        for (let iHerd=0; iHerd<this.gamedatas.herdNumber; iHerd++) {
            const keys = Object.keys(this.theHerds[iHerd].item_type).filter((key) => (key as any as number) % 100 == slowpokeNumber);
            const lastKey = keys[keys.length-1];
            let lastKeyItemWeight = this.theHerds[iHerd].item_type[lastKey].weight;
            this.theHerds[iHerd].item_type[slowpokeId].weight = lastKeyItemWeight + 1;
        }
    }

    private playCardOnTable(playerId: string, card: Card, row: number, slowpokeNumber: number) {
        if (slowpokeNumber != -1) {
            this.setSlowpokeWeight(this.mowCards.getCardUniqueId(card.type, card.number), slowpokeNumber);
        }
            
        if( playerId != this.player_id ) {
            // Some opponent played a card
            // Move card from player panel
            this.addCardToHerd(card, row, 'playertable-'+playerId);
        } else {
            // You played a card. Move card from the hand and remove corresponding item
            this.addCardToHerd(card, row, 'myhand_item_'+card.id);
            this.playerHand.removeFromStockById(''+card.id);
        }

    }
    
    private setPick(canPick: boolean) {
        dojo.toggleClass('pickBlock', 'visible', canPick);
        
        document.getElementById('pickBlock').innerHTML = '';

        if (canPick) {
            const rowPick = this.gamedatas.herdNumber > 1;
            const ids: number[] = rowPick ? [0, 1, 2] : this.gamedatas.playerorder.map(id => Number(id)).filter(id => id != Number((this as any).player_id));

            let html = `<div>${_('Or choose which opponent plays next:')}</div>`;
            ids.forEach(id => {
                const player = rowPick ? {
                    color: 'transparent',
                    name: dojo.string.substitute(_("Herd ${number}"), {'number' : id+1 }),
                } : this.gamedatas.players[id];
                html += `<button id="pickBtn${id}" class="bgabutton bgabutton_blue pickButton" style="border: 3px solid #${player.color}">${player.name}</button>`;
            });

            document.getElementById('pickBlock').innerHTML = html;

            ids.forEach(id => document.getElementById(`pickBtn${id}`).addEventListener('click', () => this.pickPlayer(id)));
        }
    }

    private disableFarmerCards(allowedFarmerCardIds: number[]) {
        this.playerFarmerHand.items.map(item => Number(item.id)).forEach((id: number) => {
            try {
                dojo.toggleClass('myfarmers_item_' + id, 'disabled', allowedFarmerCardIds.indexOf(id) === -1);
            } catch(e) {}
        });
    }

    private enableFarmerCards() {
        this.playerFarmerHand.items.map(item => Number(item.id)).forEach((id: number) => {
            try {
                dojo.removeClass('myfarmers_item_' + id, 'disabled');
            } catch(e) {}
        });
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

        // TODO check player has cards to select

        const playerId = Number((event.target as HTMLDivElement).dataset.id);

        if (playerId === (this as any).player_id) {
            return;
        }

        this.selectPlayer(playerId);
    }

    private selectPlayer(playerId: number) {
        if (this.selectedPlayerId) {
            dojo.removeClass(`playertable-${this.selectedPlayerId}`, 'selected');
        } else {
            // first selection, we add action button
            dojo.removeClass('selectionAction_button', 'disabled');
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

    public onPassFarmer() {
        if(!(this as any).checkAction('pass'))
        return;
        this.takeAction("pass");
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

    public onLookHand() {
        if(!(this as any).checkAction('viewCards'))
         return;
     
         this.takeAction("viewCards", {
            playerId: this.selectedPlayerId
        });

        this.selectedPlayerId = null;
    }

    public onPickOpponentCard() {
        if(!(this as any).checkAction('exchangeCard'))
         return;
     
         this.takeAction("exchangeCard", {
            playerId: this.selectedPlayerId
        });

        this.selectedPlayerId = null;
    }

    public next() {
         if (!(this as any).checkAction('next'))
         return;
     
         this.takeAction("next");
    }

    public selectFlieType(type: number) {
        if(!(this as any).checkAction('ignoreFlies'))
         return;

        this.takeAction("ignoreFlies", {
            playerId: type === null ? 0 : (this as any).player_id,
            type
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
        log( 'notifications subscriptions setup' );
        
        const notifs = [
            ['newHand', 500],
            ['cardPlayed', 500],
            ['farmerCardPlayed', 500],
            ['newCard', 1],
            ['newCardUpdateCounter', 1],
            ['newFarmerCard', 1],
            ['newFarmerCardUpdateCounter', 1],
            ['allowedCards', 1],
            ['directionChanged', 500],
            ['herdCollected', 2000],
            ['handCollected', 1500],
            ['replaceCards', 500],
            ['removedCard', 1],
            ['removedCardUpdateCounter', 1],
            ['activeRowChanged', 500],
            ['tableWindow', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }
    
    // from this point and below, you can write your game notifications handling methods
    
    public notif_newHand( notif: Notif<NotifNewHandArgs> ) {

        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();

        notif.args.cards.forEach((card: Card) => this.addCardToHand(card));

        if (notif.args.remainingCards) {
            this.setRemainingCards(notif.args.remainingCards);         
        }
    }
    
    public notif_cardPlayed( notif: Notif<NotifCardPlayedArgs> ) {
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        
        this.playCardOnTable(notif.args.player_id, notif.args.card, notif.args.row, notif.args.slowpokeNumber);

        this.setRemainingCards(notif.args.remainingCards);

        this.cardCounters[notif.args.player_id].incValue(-1);
    }

    public notif_farmerCardPlayed(notif: Notif<NotifFarmerCardPlayedArgs>) {
        this.playerFarmerHand.removeFromStockById(''+notif.args.card.id);
        this.farmerCardCounters[notif.args.player_id].incValue(-1);
    }
    
    public notif_allowedCards( notif: Notif<NotifAllowedCardsArgs> ) {
        if (this.gamedatas.herdNumber == 1) {
            this.enableAllowedCards(notif.args.allowedCardsIds);
        }
    }
    
    public notif_newCard( notif: Notif<NotifNewCardArgs> ) {

        const card = notif.args.card;
        setTimeout(() => {
            // timeout so new card appear after played card animation
            this.addCardToHand(card, notif.args.fromPlayerId ? 'playertable-'+notif.args.fromPlayerId : 'remainingCards');
            if (notif.args.allowedCardsIds && notif.args.allowedCardsIds.indexOf(card.id) === -1) {
                dojo.query(`#myhand_item_${card.id}`).addClass("disabled");
            }
        }, 1000);
        
    }
    
    public notif_newCardUpdateCounter( notif: Notif<NotifNewCardUpdateCounterArgs> ) {
        this.cardCounters[notif.args.playerId].incValue(1);       
    }
    
    public notif_newFarmerCard( notif: Notif<NotifNewFarmerCardArgs> ) {
        const card = notif.args.card;
        this.addFarmerCardToHand(card);        
    }
    
    public notif_newFarmerCardUpdateCounter( notif: Notif<NotifNewCardUpdateCounterArgs> ) {
        this.farmerCardCounters[notif.args.playerId].incValue(1);       
    }
    
    public notif_directionChanged( notif: Notif<DirectionChangedArgs> ) {
        if (this.gamedatas.herdNumber > 1) {
            document.getElementById('direction-animation-symbol').innerHTML = '🠗';
            dojo.toggleClass('direction-play-symbol', 'reverse-arrow', !notif.args.direction_clockwise);
        } else {            
            dojo.toggleClass('direction-play-symbol', 'direction-anticlockwise', !notif.args.direction_clockwise);
            Array.from(document.getElementsByClassName('between-players-arrow')).forEach(elem => elem.classList.toggle('direction-anticlockwise', !notif.args.direction_clockwise));
        }

        dojo.removeClass("direction-animation-symbol");
        if (this.gamedatas.herdNumber > 1) {
            dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "upToDown" : "downToUp");
        } else {
            dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
        }

        if (this.gamedatas.herdNumber > 1) {
            dojo.toggleClass('rowIndicatorBackground', 'inverse', !notif.args.direction_clockwise);
        }
    }
    
    public notif_herdCollected( notif: Notif<NotifHerdCollectedArgs> ) {
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        if (notif.args.player_id) {
            (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            
            (this as any).scoreCtrl[notif.args.player_id].toValue(notif.args.playerScore);
            this.theHerds[notif.args.row].removeAllTo( 'player_board_'+notif.args.player_id );
        } else {
            this.theHerds[notif.args.row].removeAllTo('topbar');
        }
        dojo.query("#myhand .stockitem").removeClass("disabled");
        this.allowedCardsIds = null; 
        this.playerHand.unselectAll();
    }
    
    public notif_handCollected( notif: Notif<NotifHandCollectedArgs> ) {
        if (notif.args.points > 0) {
            (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            if (this.player_id == notif.args.player_id) {
                dojo.query("#myhand").removeClass("bounce");
                dojo.query("#myhand").addClass("bounce");
            }
            
            (this as any).scoreCtrl[notif.args.player_id].toValue(notif.args.playerScore);
        }

        setTimeout(() => {
            if (this.player_id == notif.args.player_id) {
                this.playerHand.removeAll();
            }
            this.cardCounters[notif.args.player_id].toValue(0);
        }, 1450);
    }
    
    public notif_replaceCards( notif: Notif<NotifReplaceCardsArgs> ) {
        notif.args.oldCards.forEach(card => this.playerHand.removeFromStockById(''+card.id));
        notif.args.newCards.forEach(card => this.addCardToHand(card, 'remainingCards'));
    }
    
    public notif_removedCard( notif: Notif<NotifRemovedCardArgs> ) {
        this.playerHand.removeFromStockById(''+notif.args.card.id, notif.args.fromPlayerId  ? 'playertable-'+notif.args.fromPlayerId : undefined);
    }
    
    public notif_removedCardUpdateCounter( notif: Notif<NotifNewCardUpdateCounterArgs> ) {
        this.cardCounters[notif.args.playerId].incValue(-1);       
    }
    
    public notif_activeRowChanged( notif: Notif<NotifActiveRowChangedArgs> ) {
        this.gamedatas.activeRow = notif.args.activeRow;
        slideToObjectAndAttach(this, $('rowIndicator'), `rowIndicatorWrapper${notif.args.activeRow}`);
    }
    
    public notif_tableWindow( notif: Notif<any> ) {
        Object.keys(notif.args.playersScores).forEach(player_id => {
            (this as any).scoreCtrl[player_id].toValue(Number(notif.args.playersScores[player_id]));
        });
    }

    ////////////////////////////////
    ////////////////////////////////
    /////    Cards selection    ////
    ////////////////////////////////
    ////////////////////////////////
    public onPlayerHandSelectionChanged() {            
        const items = this.playerHand.getSelectedItems();
        if (items.length == 1) {
            const card = items[0];
            const action = this.pickCardAction + 'Card';
            
            if ((this as any).checkAction(action, true)) {    
                this.takeAction(action, { 
                    id: card.id
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

                this.playFarmer(id);
                
                this.playerFarmerHand.unselectAll();
            }
        }
    }

    public playFarmer(id: number) {
        this.takeAction("playFarmer", { 
            id
        });
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
        });        
    }

    private resetAllowedCards() {
        this.allowedCardsIds = null;
        this.playerHand.items.map(item => Number(item.id)).forEach((id: number) => {
            try {
                dojo.toggleClass('myhand_item_' + id, 'disabled', false);
            } catch(e) {}
        });
    }
    
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                if (args.card && (typeof args.card_display !== 'string')) {
                    const card: Card = args.card;

                    let displayedNumber: number | string = card.number;
                    let precision = null;
                    if (displayedNumber == 21 || displayedNumber == 22) {
                        displayedNumber = '';
                        precision = 'slowpoke';
                    } else if (displayedNumber == 70 || displayedNumber == 90) {
                        displayedNumber /= 10;
                        precision = 'acrobatic';
                    }

                    args.card_display = `<strong style='color: ${this.colors[Number(card.type)]}'>${displayedNumber}</strong>`;
                    
                    if (precision === 'slowpoke') {
                        args.card_display += '<span class="log-arrow rotate270"></span><span class="log-arrow rotate90"></span>';
                    } else if (precision === 'acrobatic') {
                        args.card_display += '<span class="log-arrow"></span>';
                    }
                }

                if (args.farmerCardType && typeof args.farmerCardType !== 'string') {
                    args.farmerCardType = `<div class="log-farmer-card" data-type="${args.farmerCardType}"></div>`;
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

    private addCardToHerd(card: Partial<Card>, row: number, from?: string) {
        this.addCardToStock(this.theHerds[row], card, from);
    }

    private addFarmerCardToStock(stock: Stock, card: Partial<FarmerCard>, from?: string) {
        stock.addToStockWithId(card.type, ''+card.id, from);
    }

    private addFarmerCardToHand(card: Partial<FarmerCard>, from?: string) {
        this.addFarmerCardToStock(this.playerFarmerHand, card, from);
    }
}