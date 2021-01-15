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
            console.log('mow constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
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
            console.log( "Starting game setup" );
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            this.playerHand = new ebg.stock();
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            this.theHerd = new ebg.stock();
            this.theHerd.create( this, $('theherd'), this.cardwidth, this.cardheight );

            this.createCards();
            
            console.log('this.gamedatas', this.gamedatas);
			
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
				
                this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }

            for(var pId in this.gamedatas.players){
                this.scoreCtrl[pId].toValue( this.gamedatas.players[pId].score);
            }

            // Setup game notifications to handle (see "setupNotifications" method below)
            console.log('setupNotifications');
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        createCards: function () {

            dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );

            // addItemType( type, weight, image, image_position ):
			
			// Create cards types:
			for( value=1; value<=15; value++ )   // 1-15 green
			{
				var card_type_id = this.getCardUniqueId( 0, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/cards0.jpg', value-1 );	
				this.theHerd.addItemType( card_type_id, value, g_gamethemeurl+'img/cards0.jpg', value-1 );		
			}
			
			for( value=2; value<=14; value++ )   // 2-14 yellow
			{
				var card_type_id = this.getCardUniqueId( 1, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/cards1.jpg', value-2 );	
				this.theHerd.addItemType( card_type_id, value, g_gamethemeurl+'img/cards1.jpg', value-2 );		
			}
			
			for( value=3; value<=13; value++ )   // 3-13 orange
			{
				var card_type_id = this.getCardUniqueId( 2, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/cards2.jpg', value-3 );	
				this.theHerd.addItemType( card_type_id, value, g_gamethemeurl+'img/cards2.jpg', value-3 );		
			}
			
			for( value=7; value<=9; value++ )   // 7,8,9 red
			{
				var card_type_id = this.getCardUniqueId( 3, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/cards3.jpg', value-7 );	
				this.theHerd.addItemType( card_type_id, value, g_gamethemeurl+'img/cards3.jpg', value-7 );		
			}		
            
            var cards5url = g_gamethemeurl+'img/cards5.jpg';
			
			var card_type_id = this.getCardUniqueId(5, 0);
			this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 0 );		
			this.theHerd.addItemType( card_type_id, 0, cards5url, 0 );		
			
			card_type_id = this.getCardUniqueId(5, 16);
			this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 1 );			
			this.theHerd.addItemType( card_type_id, 16, cards5url, 1 );			
			
			card_type_id = this.getCardUniqueId(5, 21);
			this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 2 );
			this.theHerd.addItemType( card_type_id, 21, cards5url, 2 );
			
			card_type_id = this.getCardUniqueId(5, 22);
			this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 3 );
			this.theHerd.addItemType( card_type_id, 22, cards5url, 3 );
			
			card_type_id = this.getCardUniqueId(5, 70);
			this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 4 );
			this.theHerd.addItemType( card_type_id, 7, cards5url, 4 );
			
			card_type_id = this.getCardUniqueId(5, 90);
            this.playerHand.addItemType( card_type_id, card_type_id, cards5url, 5 );            
            this.theHerd.addItemType( card_type_id, 9, cards5url, 5 );      
			
			// The six special cows
			// for( var i in this.gamedatas.hand)$this->special_labels as $key => value)
			// {
				// var card_type_id = this.getCardUniqueId( 5, value );
				// this.playerHand.addItemType( card_type_id, card_type_id, 'img/cards.jpg', card_type_id );		
			// }
        },       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
            this.removeActionButtons();
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                 case 'playerTurn':
                    if(this.theHerd.count() > 0) {
                        this.addActionButton( 'collectHerd_button', _('Collect herd'), 'onCollectHerd' );
                    }
                    break;

                 case 'chooseDirection':                    
                    this.addActionButton( 'keepDirection_button', _('Keep direction'), 'onKeepDirection' );
                    this.addActionButton( 'changeDirection_button', _('Change direction'), 'onChangeDirection' );
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
			//return color;
            return Number(color)*100+Number(value);
        },
		
		showCardInHand: function()		
		{
		
		},

		playCardOnTable: function( player_id, color, value, card_id )
        {
            // player_id => direction
            /*dojo.place(
                this.format_block( 'jstpl_cardontable', {
                    x: 0,//this.cardwidth*(value),
                    y: 0,//this.cardheight*(color),
                    player_id: player_id                
                } ), 'playertablecard_'+player_id );*/
                
            if( player_id != this.player_id )
            {
                // Some opponent played a card
                // Move card from player panel
                //this.placeOnObject( 'cardontable_'+player_id, 'overall_player_board_'+player_id );

                //console.log('herd', card, card.id, this.getCardUniqueId( color, value ));
				
                this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card_id );
            }
            else
            {
                // You played a card. If it exists in your hand, move card from there and remove
                // corresponding item
                
                /*if( $('myhand_item_'+card_id) )
                {
                    //this.placeOnObject( 'cardontable_'+player_id, 'myhand_item_'+card_id );*/
                    this.theHerd.addToStockWithId( this.getCardUniqueId( color, value ), card_id );
                    this.playerHand.removeFromStockById( card_id );
                /*}*/
            }

            // In any case: move it to its final destination
            //this.slideToObject( 'cardontable_'+player_id, 'playertablecard_'+player_id ).play();

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
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/mow/mow/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        
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
            console.log( 'notifications subscriptions setup' );
            
			dojo.subscribe( 'newHand', this, "notif_newHand" );
            dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );            
            dojo.subscribe( 'newCard', this, "notif_newCard" );
            dojo.subscribe( 'herdCollected', this, "notif_herdCollected" );
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
		 notif_newHand: function( notif )
        {
            console.log( 'notif_newHand', notif );

            // We received a new full hand of 5 cards.
            this.playerHand.removeAll();

            for( var i in notif.args.cards )
            {
                var card = notif.args.cards[i];
                var color = card.type;
                var value = card.type_arg;
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }            
        },
		
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed', notif );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            this.playCardOnTable(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id);
        },
        
		 notif_newCard: function( notif )
        {
            console.log( 'notif_newCard', notif );

            var card = notif.args.card;
            var color = card.type;
            var value = card.type_arg;
            this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
        },
		
        notif_herdCollected: function( notif )
        {
            console.log( 'notif_herdCollected', notif );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            this.scoreCtrl[notif.args.player_id].incValue(notif.args.points);
            this.theHerd.removeAll();
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

        onCollectHerd: function(){
            if(!this.checkAction('playCard'))
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
   });             
});
