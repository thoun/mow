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
declare const g_gamethemeurl;
declare const _;
declare const dojo;

function isAcrobatic(stockItemId: number) {
    const item = this.items[stockItemId];
    return item.type === 570 || item.type === 590;
}

/* stock method override to place acrobatics */
function updateDisplay(from: string) {
    if (!$(this.control_name)) {
        return;
    }
    const controlMarginBox = dojo.marginBox(this.control_name);
    let pageContentMarginWidth = controlMarginBox.w;
    if (this.autowidth) {
        const pageContentMarginBox = dojo.marginBox($("page-content"));
        pageContentMarginWidth = pageContentMarginBox.w;
    }
    let topDestination = 0;
    let leftDestination = 0;
    const itemsByRow = Math.max(1, Math.floor((pageContentMarginWidth) / (this.item_width + this.item_margin)));

    const scale = Math.min(1, itemsByRow / this.items.length);
    const itemWidth = this.item_width * scale;
    const itemHeight = this.item_height * scale;
    const itemMargin = this.item_margin * scale;
    const acrobaticOverlap = this.acrobatic_overlap * scale;

    let controlWidth = 0;
    const topDestinations = [];
    const leftDestinations = [];
    const zIndexes = [];
    const rows = [];
    const acrobaticRowsIndexes = [];
    this.items.forEach((item, i: number) => {
        if (typeof item.loc == "undefined") {
            const rowIndex = Math.max(0, rows.length - 1);
            //console.log(`item ${i}, rowIndex ${rowIndex}, arobatic ${this.isAcrobatic(i)}`);
            if (this.isAcrobatic(i)) { 
                if (rowIndex === 0 || rows[rowIndex-1].some(id => !this.isAcrobatic(id))) { // previous row is not acrobatics
                    acrobaticRowsIndexes.push(rowIndex);
                    rows.splice(rowIndex, 0, [Number(i)]);
                } else { // previous row is already acrobatics
                    rows[rowIndex-1].push(Number(i));
                }
            } else {                        
                if (!rows[rowIndex]) {
                    rows[rowIndex] = [Number(i)];
                } else {
                    if (rows[rowIndex].length*scale >= itemsByRow) {
                        rows.push([Number(i)]);
                    } else {
                        rows[rowIndex].push(Number(i));
                    }
                }
            }
        }
    });

    //console.log('rows', rows);
    //console.log('this.items', this.items);

    const lastRowIndex = rows.length - 1;

    rows.forEach((row, iRow: number) => {
        const rowIsAcrobatic = row.some(id => this.isAcrobatic(id));
        if (!rowIsAcrobatic) {
            row.forEach((iNotAcrobatic, iIndex: number) => {
                //console.log('iNotAcrobatic: ',iNotAcrobatic, 'items', this.items);
                const item = this.items[iNotAcrobatic];
                if (typeof item.loc == "undefined") {
                    const acrobaticRowsNumber = rows.slice(0, iRow).filter((_, rowIndex) => acrobaticRowsIndexes.indexOf(rowIndex) !== -1).length;
                    const classicRowNumber = rows.slice(0, iRow).filter((_, rowIndex) => acrobaticRowsIndexes.indexOf(rowIndex) === -1).length;

                    topDestination = classicRowNumber * (itemHeight + itemMargin) + acrobaticRowsNumber * acrobaticOverlap;
                    leftDestination = iIndex * (itemWidth + itemMargin);
                    controlWidth = Math.max(controlWidth, leftDestination + itemWidth);
                    if (this.centerItems) {
                        const itemsInCurrentRow = row.length;
                        leftDestination += (pageContentMarginWidth - itemsInCurrentRow * (itemWidth + itemMargin)) / 2;
                    }

                    topDestinations[iNotAcrobatic] = topDestination;
                    leftDestinations[iNotAcrobatic] = leftDestination;
                    zIndexes[iNotAcrobatic] = 1;
                }
            });
        }
    });

    rows.forEach((row, iRow: number) => {
        const rowIsAcrobatic = row.some(id => this.isAcrobatic(id));
        if (rowIsAcrobatic) {
            row.forEach((acrobaticNumber: number) => {
                const acrobaticDisplayedNumber = (this.items[acrobaticNumber].type / 10) % 10;
                const matchingItemIndex = this.items.findIndex(item => item.type % 10 === acrobaticDisplayedNumber);
                //console.log('iAcrobatic: ',iAcrobatic, 'acrobaticDisplayedNumber', acrobaticDisplayedNumber, 'matchingItemIndex', matchingItemIndex);
                const item = this.items[acrobaticNumber];
                if (typeof item.loc == "undefined") {
                    topDestination = iRow * (itemHeight + itemMargin);

                    topDestinations[acrobaticNumber] = topDestination;
                    leftDestinations[acrobaticNumber] = matchingItemIndex === -1 ? 0 : leftDestinations[matchingItemIndex];
                    zIndexes[acrobaticNumber] = 0;
                }
            });
        }
    });

    for (let i in this.items) {
        topDestination = topDestinations[i];
        leftDestination = leftDestinations[i];

        const item = this.items[i];
        const itemDivId = this.getItemDivId(item.id);

        let $itemDiv = $(itemDivId);
        if ($itemDiv) {
            if (typeof item.loc == "undefined") {
                dojo.fx.slideTo({
                    node: $itemDiv,
                    top: topDestination,
                    left: leftDestination,
                    duration: 1000,
                    unit: "px"
                }).play();
            } else {
                this.page.slideToObject($itemDiv, item.loc, 1000).play();
            }

            dojo.style($itemDiv, "width", itemWidth + "px");
            dojo.style($itemDiv, "height", itemHeight + "px");
            dojo.style($itemDiv, "backgroundSize", "auto " + itemHeight + "px");
        } else {
            const type = this.item_type[item.type];
            if (!type) {
                console.error("Stock control: Unknow type: " + type);
            }
            if (typeof itemDivId == "undefined") {
                console.error("Stock control: Undefined item id");
            } else {
                if (typeof itemDivId == "object") {
                    console.error("Stock control: Item id with 'object' type");
                    console.error(itemDivId);
                }
            }
            let additional_style = "";
            if (this.backgroundSize !== null) {
                additional_style += "background-size:" + this.backgroundSize;
            }
            const jstpl_stock_item_template = dojo.trim(dojo.string.substitute(this.jstpl_stock_item, {
                id: itemDivId,
                width: itemWidth,
                height: itemHeight,
                top: topDestination,
                left: leftDestination,
                image: type.image,
                position: "z-index:" + zIndexes[i],
                extra_classes: this.extraClasses,
                additional_style: additional_style
            }));
            dojo.place(jstpl_stock_item_template, this.control_name);
            $itemDiv = $(itemDivId);
            if (typeof item.loc != "undefined") {
                this.page.placeOnObject($itemDiv, item.loc);
            }
            if (this.selectable == 0) {
                dojo.addClass($itemDiv, "stockitem_unselectable");
            }
            dojo.connect($itemDiv, "onclick", this, "onClickOnItem");
            if (Number(type.image_position) !== 0) {
                let backgroundPositionWidth = 0;
                let backgroundPositionHeight = 0;
                if (this.image_items_per_row) {
                    const rowNumber = Math.floor(type.image_position / this.image_items_per_row);
                    if (!this.image_in_vertical_row) {
                        backgroundPositionWidth = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionHeight = rowNumber * 100;
                    } else {
                        backgroundPositionHeight = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionWidth = rowNumber * 100;
                    }
                    dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%");
                } else {
                    backgroundPositionWidth = type.image_position * 100;
                    dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% 0%");
                }
                dojo.style($itemDiv, "backgroundSize", "auto " + itemHeight + "px");
            }
            if (this.onItemCreate) {
                this.onItemCreate($itemDiv, item.type, itemDivId);
            }
            if (typeof from != "undefined") {
                this.page.placeOnObject($itemDiv, from);
                if (typeof item.loc == "undefined") {
                    let anim = dojo.fx.slideTo({
                        node: $itemDiv,
                        top: topDestination,
                        left: leftDestination,
                        duration: 1000,
                        unit: "px"
                    });
                    anim = this.page.transformSlideAnimTo3d(anim, $itemDiv, 1000, null);
                    anim.play();
                } else {
                    this.page.slideToObject($itemDiv, item.loc, 1000).play();
                }
            } else {
                dojo.style($itemDiv, "opacity", 0);
                dojo.fadeIn({
                    node: $itemDiv
                }).play();
            }
        }
    }
    const controlHeight = (lastRowIndex + 1 - acrobaticRowsIndexes.length) * (itemHeight + itemMargin) + acrobaticRowsIndexes.length * acrobaticOverlap;
    dojo.style(this.control_name, "height", controlHeight + "px");
    if (this.autowidth) {
        if (controlWidth > 0) {
            controlWidth += (this.item_width - itemWidth);
        }
        dojo.style(this.control_name, "width", controlWidth + "px");
    }

    dojo.style(this.control_name, "minHeight", (itemHeight + itemMargin) + "px");
}

class Mow implements Game {

    gamedatas: MowGamedatas;
    playerHand: Stock = null;
    theHerd: MowHerdStock = null;
    allowedCardsIds: number[];
    player_id: string;

    cardwidth: number = 121;
    cardheight: number = 178;
    players: { [playerId: number]: Player };
    playerNumber: number;
    
    colors = [
        'forestgreen',
        'goldenrod',
        'lightsalmon',
        'crimson',
        null,
        'teal'
    ];

    remainingCardsColors = [
        '#FF0000',
        '#FF3300',
        '#ff6600',
        '#ff9900',
        '#FFCC00',
        '#FFFF00'
    ];

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
    
    setup(gamedatas: MowGamedatas) {
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
        
        // TODO: Set up your game interface here, according to "gamedatas"
        this.playerHand = new ebg.stock() as Stock;
        this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
        this.playerHand.setSelectionMode(1);            
        this.playerHand.setSelectionAppearance('class');            
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = dojo.hitch( this, 'setupNewCard' ); 
        this.theHerd = new ebg.stock() as MowHerdStock;
        this.theHerd.create( this, $('theherd'), this.cardwidth, this.cardheight );
        this.theHerd.setSelectionMode(0);            
        this.theHerd.centerItems = true;
        this.theHerd.acrobatic_overlap = 48;
        this.theHerd.updateDisplay = (from: string) => updateDisplay.apply(this.theHerd, [from]);
        this.theHerd.isAcrobatic = (stockItemId: number) => isAcrobatic.apply(this.theHerd, [stockItemId]);

        this.createCards();
        
        //console.log('this.gamedatas', this.gamedatas);
        
        // Cards in player's hand
        this.gamedatas.hand.forEach((card: Card) => {
            const color = card.type;
            const value = card.type_arg;
            //console.log('hand', card, this.getCardUniqueId( color, value ));
            
            this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
        });
        
        // Cards played on table
        this.gamedatas.herd.forEach((card: Card) => {
            const color = card.type;
            const value = card.type_arg;
            //console.log('herd', card, card.id, this.getCardUniqueId( color, value ));
            if (card.slowpoke_type_arg) {
                this.setSlowpokeWeight(this.getCardUniqueId( color, value ), Number(card.slowpoke_type_arg));
            }
            
            this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
        });

        this.setRemainingCards(this.gamedatas.remainingCards);
        this.enableAllowedCards(this.gamedatas.allowedCardsIds);
        if (!this.gamedatas.direction_clockwise) {
            dojo.addClass('direction-play-symbol', 'direction-anticlockwise');
        }

        dojo.connect( $('keepDirectionButton'), 'onclick', this, 'onKeepDirection' );
        dojo.connect( $('changeDirectionButton'), 'onclick', this, 'onChangeDirection' );

        // Setup game notifications to handle (see "setupNotifications" method below)
        //console.log('setupNotifications');
        this.setupNotifications();

        //console.log( "Ending game setup" );
    }

    createCards() {

        dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );

        // addItemType( type, weight, image, image_position ):

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
                this.playerHand.addItemType( card_type_id, cardWeight, cardsurl, id );		
                this.theHerd.addItemType( card_type_id, cardWeight, cardsurl, id );	
            }
        }
    }     

    ///////////////////////////////////////////////////
    //// Game & client states
    
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState( stateName: string, args: any )
    {
        //console.log( 'Entering state: '+stateName );
        
        switch( stateName ) {            
            case 'playerTurn':
                this.onEnteringStatePlayerTurn(args);                    
                break;

            case 'chooseDirection':    
                this.onEnteringStateChooseDirection(args);     
                break;
        }
    }

    onEnteringStatePlayerTurn(args: any) {
        dojo.addClass("playertable-" + args.active_player, "active");
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

    onEnteringStateChooseDirection(args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            dojo[args.args.direction_clockwise ? 'removeClass' : 'addClass']('keepDirectionSymbol', 'direction-anticlockwise');
            dojo[args.args.direction_clockwise ? 'addClass' : 'removeClass']('changeDirectionSymbol', 'direction-anticlockwise');

            const keepDirectionNextPlayer = args.args.direction_clockwise ? this.getPreviousPlayer() : this.getNextPlayer();
            const changeDirectionNextPlayer = args.args.direction_clockwise ? this.getNextPlayer() : this.getPreviousPlayer();

            $("keepDirectionNextPlayer").innerHTML = keepDirectionNextPlayer.name;
            $("changeDirectionNextPlayer").innerHTML = changeDirectionNextPlayer.name;
            dojo.style( 'keepDirectionNextPlayer', 'color', '#'+keepDirectionNextPlayer.color );
            dojo.style( 'changeDirectionNextPlayer', 'color', '#'+changeDirectionNextPlayer.color );

            dojo.style( 'direction_popin', 'display', 'flex' );
            dojo[args.args.direction_clockwise ? 'removeClass' : 'addClass']('direction_popin', 'swap');
            
        }
    }

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState( stateName: string )
    {
        //console.log( 'Leaving state: '+stateName );
        
        switch( stateName ) {
        
            case 'playerTurn':  
                dojo.query(".playertable").removeClass("active");           
                break;

            case 'chooseDirection':    
                dojo.style( 'direction_popin', 'display', 'none' );
                break;   
        
            case 'dummmy':
                break;
        }               
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //        
    onUpdateActionButtons( stateName: string, args: { canCollect: boolean } )
    {
        //console.log( 'onUpdateActionButtons: '+stateName );
        (this as any).removeActionButtons();
                    
        if( (this as any).isCurrentPlayerActive() )
        {            
            switch( stateName )
            {
                case 'playerTurn':
                if (args.canCollect) {
                    (this as any).addActionButton( 'collectHerd_button', _('Collect herd'), 'onCollectHerd' );
                }
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
    
    getCardUniqueId( color: number | string, value: number | string ) {
        return Number(color)*100+Number(value);
    }
    
    getCardWeight( color: number | string, value: number | string ) {
        let displayedNumber = Number(value);
        const iColor = Number(color);
        if (displayedNumber === 70 || displayedNumber === 90) {
            displayedNumber /= 10;
        }
        //return color;
        return displayedNumber*100+iColor;
    }
    
    setSlowpokeWeight(slowpokeId: number, slowpokeNumber: number) {
        const keys = Object.keys(this.theHerd.item_type).filter((key) => (key as any as number) % 100 == slowpokeNumber);
        const lastKey = keys[keys.length-1];
        let lastKeyItemWeight = this.theHerd.item_type[lastKey].weight;
        this.theHerd.item_type[slowpokeId].weight = lastKeyItemWeight + 1;
    }

    playCardOnTable( player_id: string, color: number, value: number, card_id: string, slowpokeNumber: number ) {
        if (slowpokeNumber != -1) {
            this.setSlowpokeWeight(this.getCardUniqueId( color, value ), slowpokeNumber);
        }
            
        if( player_id != this.player_id ) {
            // Some opponent played a card
            // Move card from player panel
            this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card_id, 'playertable-'+player_id );
        } else {
            // You played a card. Move card from the hand and remove corresponding item
            this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card_id, 'myhand_item_'+card_id );
            this.playerHand.removeFromStockById( card_id );
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
    

    onCollectHerd(){
        if(!(this as any).checkAction('collectHerd'))
        return;
    
        this.takeAction("collectHerd");
    }

    onKeepDirection(){
        if(!(this as any).checkAction('setDirection'))
        return;
        this.takeAction("setDirection", {
            change: false
        });
    }

    onChangeDirection(){
        if(!(this as any).checkAction('setDirection'))
        return;
        this.takeAction("setDirection", {
            change: true
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
    setupNotifications()
    {
        //console.log( 'notifications subscriptions setup' );
        
        dojo.subscribe( 'newHand', this, "notif_newHand" );
        dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );            
        dojo.subscribe( 'newCard', this, "notif_newCard" );
        dojo.subscribe( 'allowedCards', this, "notif_allowedCards" );  
        dojo.subscribe( 'directionChanged', this, "notif_directionChanged" );
        dojo.subscribe( 'herdCollected', this, "notif_herdCollected" );
        dojo.subscribe( 'handCollected', this, "notif_handCollected" );

        (this as any).notifqueue.setSynchronous( 'herdCollected', 2000 );
        (this as any).notifqueue.setSynchronous( 'handCollected', 1500 );
    }
    
    // TODO: from this point and below, you can write your game notifications handling methods
    
    notif_newHand( notif: Notif<NotifNewHandArgs> )
    {
        //console.log( 'notif_newHand', notif );

        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();

        notif.args.cards.forEach((card: Card) => {
            const color = card.type;
            const value = card.type_arg;
            this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
        });

        this.setRemainingCards(notif.args.remainingCards);         
    }
    
    notif_cardPlayed( notif: Notif<NotifCardPlayedArgs> )
    {
        //console.log( 'notif_cardPlayed', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        
        this.playCardOnTable(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id, notif.args.slowpokeNumber);

        this.setRemainingCards(notif.args.remainingCards);
    }
    
    notif_allowedCards( notif: Notif<NotifAllowedCardsArgs> )
    {
        // console.log( 'notif_allowedCards', notif );            
        this.enableAllowedCards(notif.args.allowedCardsIds);
    }
    
    notif_newCard( notif: Notif<NotifNewCardArgs> )
    {
        //console.log( 'notif_newCard', notif );

        const card = notif.args.card;
        const color = card.type;
        const value = card.type_arg;
        setTimeout(() => {
            // timeout so new card appear after played card animation
            this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id, 'remainingCards' );
            if (this.allowedCardsIds && this.allowedCardsIds.indexOf(Number(card.id)) === -1) {
                dojo.query('#myhand_item_' + card.id).addClass("disabled");
            }
        }, 1000);
        
    }
    
    notif_directionChanged( notif: Notif<DirectionChangedArgs> )
    {
        //console.log( 'notif_directionChanged', notif );

        dojo[notif.args.direction_clockwise ? 'removeClass' : 'addClass']('direction-play-symbol', 'direction-anticlockwise');

        dojo.removeClass("direction-animation-symbol");
        dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
    }
    
    notif_herdCollected( notif: Notif<NotifHerdCollectedArgs> )
    {
        //console.log( 'notif_herdCollected', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        
        (this as any).scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
        this.theHerd.removeAllTo( 'player_board_'+notif.args.player_id );
        dojo.query("#myhand .stockitem").removeClass("disabled");
        this.allowedCardsIds = null; 
        this.playerHand.unselectAll();
    }
    
    notif_handCollected( notif: Notif<NotifHandCollectedArgs> )
    {
        // console.log( 'notif_handCollected', notif );
        
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        (this as any).displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        if (this.player_id == notif.args.player_id) {
            dojo.query("#myhand").removeClass("bounce");
            dojo.query("#myhand").addClass("bounce");
        }
        
        (this as any).scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
    }

    ////////////////////////////////
    ////////////////////////////////
    /////    Cards selection    ////
    ////////////////////////////////
    ////////////////////////////////
    onPlayerHandSelectionChanged()
    {            
        const items = this.playerHand.getSelectedItems();
        if (items.length == 1) {
            if ((this as any).checkAction('playCard', true)) {
                // Can play a card
                const card_id = items[0].id;//items[0].type

                this.takeAction("playCard", { 
                    'card_id': card_id,
                    'lock': true 
                });
                
                this.playerHand.unselectAll();
            }
        }
    }


    ////////////////////////////////
    ////////////////////////////////
    /////////    Utils    //////////
    ////////////////////////////////
    ////////////////////////////////
    
    takeAction(action: string, data?: any, callback?: Function) {
        data = data || {};
        data.lock = true;
        callback = callback || function () {};
        (this as any).ajaxcall("/mow/mow/" + action + ".html", data, this, callback);
    }

    setRemainingCards(remainingCards: number) {
        let $remainingCards = $('remainingCards');
        $remainingCards.innerHTML = remainingCards;
        dojo.style($remainingCards, "color", remainingCards > 5 ? null : this.remainingCardsColors[remainingCards]);
    }

    enableAllowedCards(allowedCardsIds: number[]) {
        this.allowedCardsIds = allowedCardsIds;
        this.playerHand.items.map(item => Number(item.id)).forEach(id => {
            try {
                const disallowed = allowedCardsIds.indexOf(id) === -1;
                dojo[disallowed ? 'addClass' : 'removeClass']('myhand_item_' + id, 'disabled');
                if (disallowed) {
                    this.playerHand.unselectItem(''+id);
                }
            } catch(e) {}
        })
        
    }
    
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    format_string_recursive(log: string, args: any) {
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

    setupNewCard( card_div: HTMLDivElement, card_type_id: number, card_id: string )
    {
        let tooltip = "<span class='tooltip-fly'></span> : " + Math.floor(card_type_id / 100) + "<br/>";
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
        (this as any).addTooltip( card_div.id, tooltip, '' );
    }

    getNextPlayer() {
        const activePlayerId = (this as any).getActivePlayerId();
        const activePlayerIndex = this.gamedatas.playerorder.findIndex(playerId => ''+playerId === activePlayerId);
        const nextPlayerIndex = activePlayerIndex >= this.gamedatas.playerorder.length-1 ? 0 : activePlayerIndex+1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[nextPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[nextPlayerIndex])];
    }

    getPreviousPlayer() {
        const activePlayerId = (this as any).getActivePlayerId();
        const activePlayerIndex = this.gamedatas.playerorder.findIndex(playerId => ''+playerId === activePlayerId);
        const previousPlayerIndex = activePlayerIndex === 0 ? this.gamedatas.playerorder.length-1 : activePlayerIndex-1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[previousPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[previousPlayerIndex])];
    }
}

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
	"ebg/stock"
],
function (dojo: Dojo, declare: Function) {
    return declare("bgagame.mow", ebg.core.gamegui, new Mow());             
});