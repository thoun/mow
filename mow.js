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
			this.cardwidth = 72;
            this.cardheight = 112;

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
			this.playerHand.image_items_per_row = 5;
            dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );
			
			// Create cards types:
			for( $value=1; $value<=15; $value++ )   // 1-15 green
			{
				var card_type_id = this.getCardUniqueId( 0, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );		
			}
			
			for( $value=2; $value<=14; $value++ )   // 2-14 yellow
			{
				var card_type_id = this.getCardUniqueId( 1, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );		
			}
			
			for( $value=3; $value<=13; $value++ )   // 3-13 orange
			{
				var card_type_id = this.getCardUniqueId( 2, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );		
			}
			
			for( $value=7; $value<=9; $value++ )   // 7,8,9 red
			{
				var card_type_id = this.getCardUniqueId( 3, value );
				this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );		
			}		
			
			
			var card_type_id = this.getCardUniqueId(5, 0);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );		
			
			card_type_id = this.getCardUniqueId(5, 16);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );			
			
			card_type_id = this.getCardUniqueId(5, 21);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );
			
			card_type_id = this.getCardUniqueId(5, 22);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );
			
			card_type_id = this.getCardUniqueId(5, 70);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );
			
			card_type_id = this.getCardUniqueId(5, 90);
			this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/sprites.png', card_type_id );
			
			// The six special cows
			// for( var i in this.gamedatas.hand)$this->special_labels as $key => $value)
			// {
				// var card_type_id = this.getCardUniqueId( 5, $value );
				// this.playerHand.addItemType( card_type_id, card_type_id, 'img/cards.jpg', card_type_id );		
			// }
			
			// Cards in player's hand
            for( var i in this.gamedatas.hand )
            {
                var card = this.gamedatas.hand[i];
                var color = card.type;
                var value = card.type_arg;
				
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }
			
			 // Cards played on table
            for( i in this.gamedatas.cardsontable )
            {
                var card = this.gamedatas.cardsontable[i];
                var color = card.type;
                var value = card.type_arg;
                var player_id = card.location_arg;
                this.playCardOnTable( player_id, color, value, card.id );
            }
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
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
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
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
			return color;
            //return color*100+value;
        },
		
		showCardInHand: function()		
		{
		
		},

		playCardOnTable: function( player_id, color, value, card_id )
        {
            // player_id => direction
            dojo.place(
                this.format_block( 'jstpl_cardinherd', {
                    x: 0,//this.cardwidth*(value),
                    y: 0,//this.cardheight*(color),
                    player_id: player_id                
                } ), 'playertablecard_'+player_id );
                
            if( player_id != this.player_id )
            {
                // Some opponent played a card
                // Move card from player panel
                this.placeOnObject( 'cardontable_'+player_id, 'overall_player_board_'+player_id );
            }
            else
            {
                // You played a card. If it exists in your hand, move card from there and remove
                // corresponding item
                
                if( $('myhand_item_'+card_id) )
                {
                    this.placeOnObject( 'cardontable_'+player_id, 'myhand_item_'+card_id );
                    this.playerHand.removeFromStockById( card_id );
                }
            }

            // In any case: move it to its final destination
            this.slideToObject( 'cardontable_'+player_id, 'playertablecard_'+player_id ).play();

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
			
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
		 notif_newHand: function( notif )
        {
            // We received a new full hand of 13 cards.
            this.playerHand.removeAll();

            for( var i in notif.args.cards )
            {
                var card = notif.args.cards[i];
                var color = card.type;
                var value = card.type_arg;
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }            
        },
		
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */

        

        ////////////////////////////////
        ////////////////////////////////
        /////    Cards selection    ////
        ////////////////////////////////
        ////////////////////////////////
        onPlayerHandSelectionChanged: function(control_name, item_id)
        {
            console.log('onPlayerHandSelectionChanged',control_name, item_id);
        if(typeof item_id == "undefined") return;
        var state = this.gamedatas.gamestate.name;
        var items = this.playerHand.getSelectedItems();

        /*if(state == "giveCards"){
            this.removeActionButtons();
            if(!this.playerHand.isSelected(item_id))
            return;

            if(items.length > this.gamedatas.nbr_cards_to_give)
            this.playerHand.unselectItem(item_id);

            items = this.playerHand.getSelectedItems()
            if(items.length == this.gamedatas.nbr_cards_to_give)
            this.addActionButton( 'giveCards_button', _('Give selected cards'), 'onGiveCards' );
        }

        else */if(state == "playerTurn"){
            this.playerHand.unselectAll();
            if(!this.checkAction('playCard', true))
            return;
            if(dojo.hasClass('myhand_item_' + item_id, 'disabled'))
            return;

            this.takeAction("playCard", { id: item_id })
        //            dojo.query('.stockitem').removeClass('receivedCard');
        }
        },
   });             
});
