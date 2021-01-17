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
            
            if (gamedatas.playerorder.length == 2) {
                dojo.style( 'direction_wrap', 'display', 'none' );
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            this.playerHand = new ebg.stock();
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            this.playerHand.setSelectionMode(0);
            this.theHerd = new ebg.stock();
            this.theHerd.create( this, $('theherd'), this.cardwidth, this.cardheight );
            this.theHerd.setSelectionMode(0);

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
                    if( this.isCurrentPlayerActive() ){     
                        this.playerHand.setSelectionMode(1);
                        dojo.query("#myhand .stockitem").addClass("disabled");
                        args.args.allowedCardIds.forEach(ids => dojo.removeClass('myhand_item_' + ids, "disabled"));
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
                    this.playerHand.setSelectionMode(0);  
                    dojo.query("#myhand .stockitem").removeClass("disabled");                  
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
                    this.addActionButton( 'keepDirection_button', _('Keep direction'), 'onKeepDirection', null, false );
                    this.addActionButton( 'changeDirection_button', _('Change direction'), 'onChangeDirection', null, false, 'red' );
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
            // player_id => direction
            /*dojo.place(
                this.format_block( 'jstpl_cardontable', {
                    x: 0,//this.cardwidth*(value),
                    y: 0,//this.cardheight*(color),
                    player_id: player_id                
                } ), 'playertablecard_'+player_id );*/

            if (slowpokeNumber != -1) {
                this.setSlowpokeWeight(this.getCardUniqueId( color, value ), slowpokeNumber);
            }
                
            if( player_id != this.player_id ) {
                // Some opponent played a card
                // Move card from player panel
                this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card_id, 'overall_player_board_'+player_id );
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
        
		 notif_newCard: function( notif )
        {
            //console.log( 'notif_newCard', notif );

            var card = notif.args.card;
            var color = card.type;
            var value = card.type_arg;
            var ctrl = this;
            setTimeout(function () {
                // timeout so new card appear after played card animation
                ctrl.playerHand.addToStockWithId( ctrl.getCardUniqueId( color, value ), card.id, 'remainingCards' );
            }, 1000);
            
        },
		
        notif_directionChanged: function( notif )
        {
            //console.log( 'notif_directionChanged', notif );

            dojo[notif.args.reverse_direction ? 'removeClass' : 'addClass']('direction', 'reverseDirection');
        },
		
        notif_herdCollected: function( notif )
        {
            //console.log( 'notif_herdCollected', notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            this.displayScoring( 'mainTable', this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            
            this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
            this.theHerd.removeAllTo( 'player_board_'+notif.args.player_id );
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
        }
   });             
});
