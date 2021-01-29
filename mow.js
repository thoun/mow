/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * mow implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * mow.js
 *
 * mow user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
	"ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.mow", ebg.core.gamegui, {
        constructor: function(){
            //console.log('mow constructor');
              
			this.playerHand = null;
			this.cardwidth = 121;
            this.cardheight = 178;

            this.colors = [
                'forestgreen',
                'goldenrod',
                'lightsalmon',
                'crimson',
                null,
                'teal'
            ];
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            //console.log( "Starting game setup" );
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                //var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed

                /*for(var pId in this.gamedatas.players){
                    console.log(this.scoreCtrl, pId, this.gamedatas.players)
                    this.scoreCtrl[pId].toValue( this.gamedatas.players[pId].score);
                }*/
            }

            // Place payer zone
            this.players = gamedatas.players;
            this.player_number = Object.keys(this.players).length;

            var ids = Object.keys(this.players);
            var player_id = gamedatas.current_player_id;
            if(!ids.includes(player_id))
                player_id = ids[0];

            const bottomPlayers = this.player_number === 5 ? 2 : 1;
            
            for(var i = 1; i <= this.player_number; i++) {
                var player = this.players[player_id];

                dojo.place(this.format_block( 'jstpl_playertable', {
                    player_id: player_id,
                    player_color: player['color'],
                    player_name: (player['name'].length > 10? (player['name'].substr(0,10) + "...") : player['name'])
                } ), i > bottomPlayers ? 'toprowplayers' : 'bottomrowplayers');

                player_id = gamedatas.next_players_id[player_id];
            }
            
            if (Object.keys(gamedatas.players).length == 2) {
                dojo.style( 'direction_wrap', 'display', 'none' );
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            this.playerHand = new ebg.stock();
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            this.playerHand.setSelectionMode(1);            
            this.playerHand.setSelectionAppearance('class');            
            this.playerHand.centerItems = true;
            this.theHerd = new ebg.stock();
            this.theHerd.create( this, $('theherd'), this.cardwidth, this.cardheight );
            this.theHerd.setSelectionMode(0);            
            this.theHerd.centerItems = true;
            this.theHerd.acrobatic_overlap = 48;
            this.theHerd.updateDisplay = (from) => this.updateDisplay.apply(this.theHerd, [from]);
            this.theHerd.isAcrobatic = (stockItemId) => this.isAcrobatic.apply(this.theHerd, [stockItemId]);

            this.createCards();
            
            //console.log('this.gamedatas', this.gamedatas);
			
			// Cards in player's hand
            for( var i in this.gamedatas.hand )
            {
                var card = this.gamedatas.hand[i];
                var color = card.type;
                var value = card.type_arg;
                //console.log('hand', card, this.getCardUniqueId( color, value ));
				
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }
			
			 // Cards played on table
            for( i in this.gamedatas.herd )
            {
                var card = this.gamedatas.herd[i];
                var color = card.type;
                var value = card.type_arg;
                //console.log('herd', card, card.id, this.getCardUniqueId( color, value ));
                if (card.slowpoke_type_arg) {
                    this.setSlowpokeWeight(this.getCardUniqueId( color, value ), Number(card.slowpoke_type_arg));
                }
				
                this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }

            this.setRemainingCards(this.gamedatas.remainingCards);
            this.enableAllowedCards(this.gamedatas.allowedCardsIds);
            if (this.gamedatas.reverse_direction) {
                dojo.addClass('direction', 'reverseDirection');
            }

            dojo.connect( $('keepDirectionButton'), 'onclick', this, 'onKeepDirection' );
            dojo.connect( $('changeDirectionButton'), 'onclick', this, 'onChangeDirection' );

            // Setup game notifications to handle (see "setupNotifications" method below)
            //console.log('setupNotifications');
            this.setupNotifications();

            //console.log( "Ending game setup" );
        },

        createCards: function () {

            dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );

            // addItemType( type, weight, image, image_position ):

            var idsByType = [[], [], [], []];
			
			// Create cards types:
			for( value=1; value<=15; value++ ) {  // 1-15 green
                idsByType[0].push(value);
			}
			
			for( value=2; value<=14; value++ ) {  // 2-14 yellow
				idsByType[1].push(value);
			}
			
			for( value=3; value<=13; value++ ) {  // 3-13 orange
				idsByType[2].push(value);
			}
			
			for( value=7; value<=9; value++ ) {  // 7,8,9 red
				idsByType[3].push(value);
			}		
            

            idsByType[5] = [0, 16, 21, 22, 70, 90];

            for (type in idsByType) {
                var cardsurl = g_gamethemeurl+'img/cards'+type+'.jpg';

                for (id=0; id<idsByType[type].length; id++) {
                    var cardId = idsByType[type][id];
                    var card_type_id = this.getCardUniqueId(type, cardId);
                    var cardWeight = this.getCardWeight(type, cardId);
                    this.playerHand.addItemType( card_type_id, cardWeight, cardsurl, id );		
                    this.theHerd.addItemType( card_type_id, cardWeight, cardsurl, id );	
                }
            }
        },       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            //console.log( 'Entering state: '+stateName );
            
            switch( stateName ) {            
                case 'playerTurn':
                    if( this.isCurrentPlayerActive() && this.playerHand.getSelectedItems().length === 1) {
                        const selectedCardId = this.playerHand.getSelectedItems()[0].id;
                        if (this.allowedCardsIds && this.allowedCardsIds.indexOf(Number(selectedCardId)) !== -1) {
                            this.onPlayerHandSelectionChanged();
                        }
                    }
                    
                    break;

                case 'chooseDirection':    
                    if (this.isCurrentPlayerActive()) {
                        dojo[args.args.reverse_direction ? 'addClass' : 'removeClass']('keepDirectionCard', 'reverseDirection');
                        dojo[args.args.reverse_direction ? 'removeClass' : 'addClass']('changeDirectionCard', 'reverseDirection');

                        dojo.style( 'direction_popin', 'display', 'flex' );
                    }
                    break;            
            
                case 'dummmy':
                    break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            //console.log( 'Leaving state: '+stateName );
            
            switch( stateName ) {
            
                case 'playerTurn':             
                    break;

                case 'chooseDirection':    
                    dojo.style( 'direction_popin', 'display', 'none' );
                    break;   
           
                case 'dummmy':
                    break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            //console.log( 'onUpdateActionButtons: '+stateName );
            this.removeActionButtons();
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                 case 'playerTurn':
                    if(args.canCollect) {
                        this.addActionButton( 'collectHerd_button', _('Collect herd'), 'onCollectHerd' );
                    }
                    break;

                 case 'chooseDirection':                  
                    //this.addActionButton( 'keepDirection_button', _('Keep direction'), 'onKeepDirection', null, false );
                    //this.addActionButton( 'changeDirection_button', _('Change direction'), 'onChangeDirection', null, false, 'red' );
                    break;
                }

            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
		
        getCardUniqueId: function( color, value )
        {
            return Number(color)*100+Number(value);
        },
		
        getCardWeight: function( color, value )
        {
            var displayedNumber = Number(value);
            var iColor = Number(color);
            if (displayedNumber === 70 || displayedNumber === 90) {
                displayedNumber /= 10;
            }
            //return color;
            return displayedNumber*100+iColor;
        },
		
		setSlowpokeWeight: function(slowpokeId, slowpokeNumber)		
		{
            var keys = Object.keys(this.theHerd.item_type).filter(function(key) { return key % 100 == slowpokeNumber});
            var lastKey = keys[keys.length-1];
            lastKeyItemWeight = this.theHerd.item_type[lastKey].weight;
            this.theHerd.item_type[slowpokeId].weight = lastKeyItemWeight + 1;
		},

		playCardOnTable: function( player_id, color, value, card_id, slowpokeNumber )
        {
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

        },
		
        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
       

        onCollectHerd: function(){
            if(!this.checkAction('collectHerd'))
            return;
        
            //var items = this.playerHand.getSelectedItems();
            // Should be useless now
            /*if(items.length != this.nbr_cards_to_give){
            this.showMessage(dojo.string.substitute(_("You must select exactly ${n} cards"), {n: this.nbr_cards_to_give}), 'error');
            return;
            }*/
        
            this.takeAction("collectHerd"/*, {
            cards: items.map(item => item.id).join(';')
            }*/);
        },

        onKeepDirection: function(){
            if(!this.checkAction('setDirection'))
            return;
            this.takeAction("setDirection", {
                change: false
            });
        },

        onChangeDirection: function(){
            if(!this.checkAction('setDirection'))
            return;
            this.takeAction("setDirection", {
                change: true
            });
        },
              
        
        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your mow.game.php file.
        
        */
        setupNotifications: function()
        {
            //console.log( 'notifications subscriptions setup' );
            
			dojo.subscribe( 'newHand', this, "notif_newHand" );
            dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );            
            dojo.subscribe( 'newCard', this, "notif_newCard" );
            dojo.subscribe( 'allowedCards', this, "notif_allowedCards" );  
            dojo.subscribe( 'directionChanged', this, "notif_directionChanged" );
            dojo.subscribe( 'herdCollected', this, "notif_herdCollected" );
            dojo.subscribe( 'handCollected', this, "notif_handCollected" );
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
		 notif_newHand: function( notif )
        {
            //console.log( 'notif_newHand', notif );

            // We received a new full hand of 5 cards.
            this.playerHand.removeAll();

            for( var i in notif.args.cards )
            {
                var card = notif.args.cards[i];
                var color = card.type;
                var value = card.type_arg;
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }  

            this.setRemainingCards(notif.args.remainingCards);         
        },
		
        notif_cardPlayed: function( notif )
        {
            //console.log( 'notif_cardPlayed', notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            this.playCardOnTable(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id, notif.args.slowpokeNumber);

            this.setRemainingCards(notif.args.remainingCards);
        },
		
        notif_allowedCards: function( notif )
        {
            // console.log( 'notif_allowedCards', notif );            
            this.enableAllowedCards(notif.args.allowedCardsIds);
        },
        
		 notif_newCard: function( notif )
        {
            //console.log( 'notif_newCard', notif );

            var card = notif.args.card;
            var color = card.type;
            var value = card.type_arg;
            var ctrl = this;
            setTimeout(() => {
                // timeout so new card appear after played card animation
                ctrl.playerHand.addToStockWithId( ctrl.getCardUniqueId( color, value ), card.id, 'remainingCards' );
                if (this.allowedCardsIds && this.allowedCardsIds.indexOf(Number(card.id)) === -1) {
                    dojo.query('#myhand_item_' + card.id).addClass("disabled");
                }
            }, 1000);
            
        },
		
        notif_directionChanged: function( notif )
        {
            //console.log( 'notif_directionChanged', notif );

            dojo[notif.args.reverse_direction ? 'addClass' : 'removeClass']('direction', 'reverseDirection');
        },
		
        notif_herdCollected: function( notif )
        {
            //console.log( 'notif_herdCollected', notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            this.displayScoring( 'playertable-'+notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            
            this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
            this.theHerd.removeAllTo( 'player_board_'+notif.args.player_id );
            dojo.query("#myhand .stockitem").removeClass("disabled");
            this.allowedCardsIds = null; 
        },
		
        notif_handCollected: function( notif )
        {
            //console.log( 'notif_handCollected', notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            if (this.player_id == notif.args.player_id) {
                this.displayScoring( 'myhand_wrap', this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            }
            
            this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
        },

        ////////////////////////////////
        ////////////////////////////////
        /////    Cards selection    ////
        ////////////////////////////////
        ////////////////////////////////
        onPlayerHandSelectionChanged: function(control_name, item_id)
        {            
            var items = this.playerHand.getSelectedItems();
            if (items.length == 1) {
                if (this.checkAction('playCard', true)) {
                    // Can play a card
                    var card_id = items[0].id;//items[0].type

                    this.takeAction("playCard", { 
                        'card_id': card_id,
                        'lock': true 
                    });
                    
                    this.playerHand.unselectAll();
                }
            }
        },


        ////////////////////////////////
        ////////////////////////////////
        /////////    Utils    //////////
        ////////////////////////////////
        ////////////////////////////////
        
        takeAction: function (action, data, callback) {
          data = data || {};
          data.lock = true;
          callback = callback || function (res) { };
          this.ajaxcall("/mow/mow/" + action + ".html", data, this, callback);
        },

        setRemainingCards(remainingCards) {
            $('remainingCards').innerHTML = remainingCards;
            if (remainingCards > 0) {
                dojo.removeClass('remainingCards', 'remainingCardsEmpty');
            } else {
                dojo.addClass('remainingCards', 'remainingCardsEmpty');
            }
        },

        enableAllowedCards(allowedCardsIds) {
            this.allowedCardsIds = allowedCardsIds;
            try {
                dojo.query("#myhand .stockitem").addClass("disabled");
                allowedCardsIds.forEach(id => dojo.removeClass('myhand_item_' + id, "disabled"));
            } catch(e) {}
        },
        
        /* This enable to inject translatable styled things to logs or action bar */
        /* @Override */
        format_string_recursive : function(log, args) {
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
            return this.inherited(arguments);
        },

        isAcrobatic: function(stockItemId) {
            var item = this.items[stockItemId];
            return item.type === 570 || item.type === 590;
        },

        /* stock method override to place acrobatics */
        updateDisplay: function(from) {
            if (!$(this.control_name)) {
                return;
            }
            var controlMarginBox = dojo.marginBox(this.control_name);
            var itemWidth = this.item_width;
            var pageContentMarginWidth = controlMarginBox.w;
            if (this.autowidth) {
                var pageContentMarginBox = dojo.marginBox($("page-content"));
                pageContentMarginWidth = pageContentMarginBox.w;
            }
            var topDestination = 0;
            var leftDestination = 0;
            var itemsByRow = Math.max(1, Math.floor((pageContentMarginWidth) / (itemWidth + this.item_margin)));
            var controlWidth = 0;
            var topDestinations = [];
            var leftDestinations = [];
            var zIndexes = [];
            var rows = [];
            var acrobaticRowsIndexes = [];
            for (var i in this.items) {
                var item = this.items[i];
                if (typeof item.loc == "undefined") {
                    var rowIndex = Math.max(0, rows.length - 1);
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
                            if (rows[rowIndex].length >= itemsByRow) {
                                rows.push([Number(i)]);
                            } else {
                                rows[rowIndex].push(Number(i));
                            }
                        }
                    }
                }
            }

            //console.log('rows', rows);
            //console.log('this.items', this.items);

            var lastRowIndex = rows.length - 1;

            for (var iRow in rows) {
                var row = rows[iRow];
                var rowIsAcrobatic = row.some(id => this.isAcrobatic(id));
                if (!rowIsAcrobatic) {
                    for (var iIndex in row) {
                        var i = row[iIndex];
                        //console.log('i: ',i, 'items', this.items);
                        var item = this.items[i];
                        if (typeof item.loc == "undefined") {
                            var acrobaticRowsNumber = rows.slice(0, iRow).filter((_, rowIndex) => acrobaticRowsIndexes.indexOf(rowIndex) !== -1).length;
                            var classicRowNumber = rows.slice(0, iRow).filter((_, rowIndex) => acrobaticRowsIndexes.indexOf(rowIndex) === -1).length;

                            topDestination = classicRowNumber * (this.item_height + this.item_margin) + acrobaticRowsNumber * this.acrobatic_overlap;
                            leftDestination = iIndex * (itemWidth + this.item_margin);
                            controlWidth = Math.max(controlWidth, leftDestination + itemWidth);
                            if (this.centerItems) {
                                var itemsInCurrentRow = row.length;
                                leftDestination += (pageContentMarginWidth - itemsInCurrentRow * (itemWidth + this.item_margin)) / 2;
                            }

                            topDestinations[i] = topDestination;
                            leftDestinations[i] = leftDestination;
                            zIndexes[i] = 1;
                        }
                    }
                }
            }
            for (var iRow in rows) {
                var row = rows[iRow];
                var rowIsAcrobatic = row.some(id => this.isAcrobatic(id));
                if (rowIsAcrobatic) {
                    for (var iIndex in row) {
                        var i = row[iIndex];
                        var acrobaticDisplayedNumber = (this.items[i].type / 10) % 10;
                        var matchingItemIndex = this.items.findIndex(item => item.type % 10 === acrobaticDisplayedNumber);
                        //console.log('i: ',i, 'acrobaticDisplayedNumber', acrobaticDisplayedNumber, 'matchingItemIndex', matchingItemIndex);
                        var item = this.items[i];
                        if (typeof item.loc == "undefined") {
                            topDestination = iRow * (this.item_height + this.item_margin);

                            topDestinations[i] = topDestination;
                            leftDestinations[i] = matchingItemIndex === -1 ? 0 : leftDestinations[matchingItemIndex];
                            zIndexes[i] = 0;
                        }
                    }
                }
            }

            for (var i in this.items) {
                topDestination = topDestinations[i];
                leftDestination = leftDestinations[i];

                var item = this.items[i];
                var itemDivId = this.getItemDivId(item.id);

                var $itemDiv = $(itemDivId);
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
                } else {
                    var type = this.item_type[item.type];
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
                    additional_style = "";
                    if (this.backgroundSize !== null) {
                        additional_style += "background-size:" + this.backgroundSize;
                    }
                    var jstpl_stock_item_template = dojo.trim(dojo.string.substitute(this.jstpl_stock_item, {
                        id: itemDivId,
                        width: this.item_width,
                        height: this.item_height,
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
                    if (toint(type.image_position) !== 0) {
                        var backgroundPositionWidth = 0;
                        var backgroundPositionHeight = 0;
                        if (this.image_items_per_row) {
                            var row = Math.floor(type.image_position / this.image_items_per_row);
                            if (!this.image_in_vertical_row) {
                                backgroundPositionWidth = (type.image_position - (row * this.image_items_per_row)) * 100;
                                backgroundPositionHeight = row * 100;
                            } else {
                                backgroundPositionHeight = (type.image_position - (row * this.image_items_per_row)) * 100;
                                backgroundPositionWidth = row * 100;
                            }
                            dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%");
                        } else {
                            backgroundPositionWidth = type.image_position * 100;
                            dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% 0%");
                        }
                    }
                    if (this.onItemCreate) {
                        this.onItemCreate($itemDiv, item.type, itemDivId);
                    }
                    if (typeof from != "undefined") {
                        this.page.placeOnObject($itemDiv, from);
                        if (typeof item.loc == "undefined") {
                            var anim = dojo.fx.slideTo({
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
            var controlHeight = (lastRowIndex + 1 - acrobaticRowsIndexes.length) * (this.item_height + this.item_margin) + acrobaticRowsIndexes.length * this.acrobatic_overlap;
            dojo.style(this.control_name, "height", controlHeight + "px");
            if (this.autowidth) {
                if (controlWidth > 0) {
                    controlWidth += (this.item_width - itemWidth);
                }
                dojo.style(this.control_name, "width", controlWidth + "px");
            }
        }
   });             
});
