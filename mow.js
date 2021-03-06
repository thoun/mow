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
function isAcrobatic(stockItemId) {
    var item = this.items[stockItemId];
    return item.type === 570 || item.type === 590;
}
/* stock method override to place acrobatics */
function updateDisplay(from) {
    var _this = this;
    if (!$(this.control_name)) {
        return;
    }
    var controlMarginBox = dojo.marginBox(this.control_name);
    var pageContentMarginWidth = controlMarginBox.w;
    if (this.autowidth) {
        var pageContentMarginBox = dojo.marginBox($("page-content"));
        pageContentMarginWidth = pageContentMarginBox.w;
    }
    var topDestination = 0;
    var leftDestination = 0;
    var itemsByRow = Math.max(1, Math.floor((pageContentMarginWidth) / (this.item_width + this.item_margin)));
    var scale = Math.min(1, itemsByRow / this.items.length);
    var itemWidth = this.item_width * scale;
    var itemHeight = this.item_height * scale;
    var itemMargin = this.item_margin * scale;
    var acrobaticOverlap = this.acrobatic_overlap * scale;
    var controlWidth = 0;
    var topDestinations = [];
    var leftDestinations = [];
    var zIndexes = [];
    var rows = [];
    var acrobaticRowsIndexes = [];
    this.items.forEach(function (item, i) {
        if (typeof item.loc == "undefined") {
            var rowIndex = Math.max(0, rows.length - 1);
            //console.log(`item ${i}, rowIndex ${rowIndex}, arobatic ${this.isAcrobatic(i)}`);
            if (_this.isAcrobatic(i)) {
                if (rowIndex === 0 || rows[rowIndex - 1].some(function (id) { return !_this.isAcrobatic(id); })) { // previous row is not acrobatics
                    acrobaticRowsIndexes.push(rowIndex);
                    rows.splice(rowIndex, 0, [Number(i)]);
                }
                else { // previous row is already acrobatics
                    rows[rowIndex - 1].push(Number(i));
                }
            }
            else {
                if (!rows[rowIndex]) {
                    rows[rowIndex] = [Number(i)];
                }
                else {
                    if (rows[rowIndex].length * scale >= itemsByRow) {
                        rows.push([Number(i)]);
                    }
                    else {
                        rows[rowIndex].push(Number(i));
                    }
                }
            }
        }
    });
    //console.log('rows', rows);
    //console.log('this.items', this.items);
    var lastRowIndex = rows.length - 1;
    rows.forEach(function (row, iRow) {
        var rowIsAcrobatic = row.some(function (id) { return _this.isAcrobatic(id); });
        if (!rowIsAcrobatic) {
            row.forEach(function (iNotAcrobatic, iIndex) {
                //console.log('iNotAcrobatic: ',iNotAcrobatic, 'items', this.items);
                var item = _this.items[iNotAcrobatic];
                if (typeof item.loc == "undefined") {
                    var acrobaticRowsNumber = rows.slice(0, iRow).filter(function (_, rowIndex) { return acrobaticRowsIndexes.indexOf(rowIndex) !== -1; }).length;
                    var classicRowNumber = rows.slice(0, iRow).filter(function (_, rowIndex) { return acrobaticRowsIndexes.indexOf(rowIndex) === -1; }).length;
                    topDestination = classicRowNumber * (itemHeight + itemMargin) + acrobaticRowsNumber * acrobaticOverlap;
                    leftDestination = iIndex * (itemWidth + itemMargin);
                    controlWidth = Math.max(controlWidth, leftDestination + itemWidth);
                    if (_this.centerItems) {
                        var itemsInCurrentRow = row.length;
                        leftDestination += (pageContentMarginWidth - itemsInCurrentRow * (itemWidth + itemMargin)) / 2;
                    }
                    topDestinations[iNotAcrobatic] = topDestination;
                    leftDestinations[iNotAcrobatic] = leftDestination;
                    zIndexes[iNotAcrobatic] = 1;
                }
            });
        }
    });
    rows.forEach(function (row, iRow) {
        var rowIsAcrobatic = row.some(function (id) { return _this.isAcrobatic(id); });
        if (rowIsAcrobatic) {
            row.forEach(function (acrobaticNumber) {
                var acrobaticDisplayedNumber = (_this.items[acrobaticNumber].type / 10) % 10;
                var matchingItemIndex = _this.items.findIndex(function (item) { return item.type % 10 === acrobaticDisplayedNumber; });
                //console.log('iAcrobatic: ',iAcrobatic, 'acrobaticDisplayedNumber', acrobaticDisplayedNumber, 'matchingItemIndex', matchingItemIndex);
                var item = _this.items[acrobaticNumber];
                if (typeof item.loc == "undefined") {
                    topDestination = iRow * (itemHeight + itemMargin);
                    topDestinations[acrobaticNumber] = topDestination;
                    leftDestinations[acrobaticNumber] = matchingItemIndex === -1 ? 0 : leftDestinations[matchingItemIndex];
                    zIndexes[acrobaticNumber] = 0;
                }
            });
        }
    });
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
            }
            else {
                this.page.slideToObject($itemDiv, item.loc, 1000).play();
            }
            dojo.style($itemDiv, "width", itemWidth + "px");
            dojo.style($itemDiv, "height", itemHeight + "px");
            dojo.style($itemDiv, "backgroundSize", "auto " + itemHeight + "px");
        }
        else {
            var type = this.item_type[item.type];
            if (!type) {
                console.error("Stock control: Unknow type: " + type);
            }
            if (typeof itemDivId == "undefined") {
                console.error("Stock control: Undefined item id");
            }
            else {
                if (typeof itemDivId == "object") {
                    console.error("Stock control: Item id with 'object' type");
                    console.error(itemDivId);
                }
            }
            var additional_style = "";
            if (this.backgroundSize !== null) {
                additional_style += "background-size:" + this.backgroundSize;
            }
            var jstpl_stock_item_template = dojo.trim(dojo.string.substitute(this.jstpl_stock_item, {
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
                var backgroundPositionWidth = 0;
                var backgroundPositionHeight = 0;
                if (this.image_items_per_row) {
                    var rowNumber = Math.floor(type.image_position / this.image_items_per_row);
                    if (!this.image_in_vertical_row) {
                        backgroundPositionWidth = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionHeight = rowNumber * 100;
                    }
                    else {
                        backgroundPositionHeight = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionWidth = rowNumber * 100;
                    }
                    dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%");
                }
                else {
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
                    var anim = dojo.fx.slideTo({
                        node: $itemDiv,
                        top: topDestination,
                        left: leftDestination,
                        duration: 1000,
                        unit: "px"
                    });
                    anim = this.page.transformSlideAnimTo3d(anim, $itemDiv, 1000, null);
                    anim.play();
                }
                else {
                    this.page.slideToObject($itemDiv, item.loc, 1000).play();
                }
            }
            else {
                dojo.style($itemDiv, "opacity", 0);
                dojo.fadeIn({
                    node: $itemDiv
                }).play();
            }
        }
    }
    var controlHeight = (lastRowIndex + 1 - acrobaticRowsIndexes.length) * (itemHeight + itemMargin) + acrobaticRowsIndexes.length * acrobaticOverlap;
    dojo.style(this.control_name, "height", controlHeight + "px");
    if (this.autowidth) {
        if (controlWidth > 0) {
            controlWidth += (this.item_width - itemWidth);
        }
        dojo.style(this.control_name, "width", controlWidth + "px");
    }
    dojo.style(this.control_name, "minHeight", (itemHeight + itemMargin) + "px");
}
var MowCards = /** @class */ (function () {
    function MowCards() {
    }
    MowCards.prototype.createCards = function (stocks) {
        var _this = this;
        var idsByType = [[], [], [], []];
        // Create cards types:
        for (var number = 1; number <= 15; number++) { // 1-15 green
            idsByType[0].push(number);
        }
        for (var number = 2; number <= 14; number++) { // 2-14 yellow
            idsByType[1].push(number);
        }
        for (var number = 3; number <= 13; number++) { // 3-13 orange
            idsByType[2].push(number);
        }
        for (var number = 7; number <= 9; number++) { // 7,8,9 red
            idsByType[3].push(number);
        }
        idsByType[5] = [0, 16, 21, 22, 70, 90];
        idsByType.forEach(function (idByType, type) {
            var cardsurl = g_gamethemeurl + "img/cards" + type + ".jpg";
            idByType.forEach(function (cardId, id) {
                return stocks.forEach(function (stock) {
                    return stock.addItemType(_this.getCardUniqueId(type, cardId), _this.getCardWeight(type, cardId), cardsurl, id);
                });
            });
        });
    };
    MowCards.prototype.getCardUniqueId = function (color, value) {
        return color * 100 + value;
    };
    MowCards.prototype.getCardWeight = function (color, value) {
        var displayedNumber = value;
        if (displayedNumber === 70 || displayedNumber === 90) {
            displayedNumber /= 10;
        }
        return displayedNumber * 100 + color;
    };
    MowCards.prototype.getTooltip = function (cardTypeId) {
        var tooltip = "<div class=\"tooltip-fly\"><span class=\"tooltip-fly-img\"></span> : " + Math.floor(cardTypeId / 100) + "</div>";
        switch (cardTypeId) {
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
    };
    return MowCards;
}());
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
//declare const doj: Dojoo;
var Mow = /** @class */ (function () {
    function Mow() {
        this.playerHand = null;
        this.theHerd = null;
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
        this.remainingCardsColors = [
            '#FF0000',
            '#FF3300',
            '#ff6600',
            '#ff9900',
            '#FFCC00',
            '#FFFF00'
        ];
        this.mowCards = new MowCards();
    }
    /*
        setup:
        
        This method must set up the game user interface according to current game situation specified
        in parameters.
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Mow.prototype.setup = function (gamedatas) {
        //console.log( "Starting game setup" );
        var _this = this;
        // Place payer zone
        this.players = gamedatas.players;
        this.playerNumber = Object.keys(this.players).length;
        var ids = Object.keys(this.players);
        var playerId = gamedatas.current_player_id;
        if (!ids.includes(playerId)) {
            playerId = ids[0];
        }
        var bottomPlayers = this.playerNumber === 5 ? 2 : 1;
        for (var i = 1; i <= this.playerNumber; i++) {
            var player = this.players[playerId];
            dojo.place(this.format_block('jstpl_playertable', {
                player_id: playerId,
                player_color: player.color,
                player_name: (player.name.length > 10 ? player.name.substr(0, 10) + "..." : player.name)
            }), i > bottomPlayers ? 'toprowplayers' : 'bottomrowplayers');
            playerId = gamedatas.next_players_id[playerId];
        }
        if (Object.keys(gamedatas.players).length == 2) {
            dojo.style('direction-text', 'display', 'none');
        }
        // TODO: Set up your game interface here, according to "gamedatas"
        this.playerHand = new ebg.stock();
        this.playerHand.create(this, $('myhand'), this.cardwidth, this.cardheight);
        this.playerHand.setSelectionMode(1);
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = dojo.hitch(this, 'setupNewCard');
        dojo.connect(this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged');
        this.theHerd = new ebg.stock();
        this.theHerd.create(this, $('theherd'), this.cardwidth, this.cardheight);
        this.theHerd.setSelectionMode(0);
        this.theHerd.centerItems = true;
        this.theHerd.acrobatic_overlap = 48;
        this.theHerd.updateDisplay = function (from) { return updateDisplay.apply(_this.theHerd, [from]); };
        this.theHerd.isAcrobatic = function (stockItemId) { return isAcrobatic.apply(_this.theHerd, [stockItemId]); };
        this.mowCards.createCards([this.theHerd, this.playerHand]);
        //console.log('this.gamedatas', this.gamedatas);
        // Cards in player's hand
        this.gamedatas.hand.forEach(function (card) { return _this.addCardToHand(card); });
        // Cards played on table
        this.gamedatas.herd.forEach(function (card) {
            var cardUniqueId = _this.mowCards.getCardUniqueId(card.type, card.number);
            if (card.slowpokeNumber) {
                _this.setSlowpokeWeight(cardUniqueId, card.slowpokeNumber);
            }
            _this.addCardToHerd(card);
        });
        this.setRemainingCards(this.gamedatas.remainingCards);
        this.enableAllowedCards(this.gamedatas.allowedCardsIds);
        if (!this.gamedatas.direction_clockwise) {
            dojo.addClass('direction-play-symbol', 'direction-anticlockwise');
        }
        dojo.connect($('keepDirectionButton'), 'onclick', this, 'onKeepDirection');
        dojo.connect($('changeDirectionButton'), 'onclick', this, 'onChangeDirection');
        // Setup game notifications to handle (see "setupNotifications" method below)
        //console.log('setupNotifications');
        this.setupNotifications();
        //console.log( "Ending game setup" );
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Mow.prototype.onEnteringState = function (stateName, args) {
        //console.log( 'Entering state: '+stateName );
        switch (stateName) {
            case 'playerTurn':
                this.onEnteringStatePlayerTurn(args);
                break;
            case 'chooseDirection':
                this.onEnteringStateChooseDirection(args.args);
                break;
        }
    };
    Mow.prototype.onEnteringStatePlayerTurn = function (args) {
        var _this = this;
        var _a;
        dojo.addClass("playertable-" + args.active_player, "active");
        if (this.isCurrentPlayerActive() && this.playerHand.getSelectedItems().length === 1) {
            var selectedCardId = this.playerHand.getSelectedItems()[0].id;
            if (((_a = this.allowedCardsIds) === null || _a === void 0 ? void 0 : _a.indexOf(Number(selectedCardId))) !== -1) {
                setTimeout(function () {
                    if (_this.isInterfaceLocked()) {
                        _this.playerHand.unselectAll();
                    }
                    else {
                        _this.onPlayerHandSelectionChanged();
                    }
                }, 250);
            }
        }
    };
    Mow.prototype.onEnteringStateChooseDirection = function (args) {
        if (this.isCurrentPlayerActive()) {
            dojo.toggleClass('keepDirectionSymbol', 'direction-anticlockwise', !args.direction_clockwise);
            dojo.toggleClass('changeDirectionSymbol', 'direction-anticlockwise', args.direction_clockwise);
            var keepDirectionNextPlayer = args.direction_clockwise ? this.getPreviousPlayer() : this.getNextPlayer();
            var changeDirectionNextPlayer = args.direction_clockwise ? this.getNextPlayer() : this.getPreviousPlayer();
            $("keepDirectionNextPlayer").innerHTML = keepDirectionNextPlayer.name;
            $("changeDirectionNextPlayer").innerHTML = changeDirectionNextPlayer.name;
            dojo.style('keepDirectionNextPlayer', 'color', '#' + keepDirectionNextPlayer.color);
            dojo.style('changeDirectionNextPlayer', 'color', '#' + changeDirectionNextPlayer.color);
            dojo.style('direction_popin', 'display', 'flex');
            dojo.toggleClass('direction_popin', 'swap', !args.direction_clockwise);
        }
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Mow.prototype.onLeavingState = function (stateName) {
        //console.log( 'Leaving state: '+stateName );
        switch (stateName) {
            case 'playerTurn':
                dojo.query(".playertable").removeClass("active");
                break;
            case 'chooseDirection':
                dojo.style('direction_popin', 'display', 'none');
                break;
            case 'dummmy':
                break;
        }
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //        
    Mow.prototype.onUpdateActionButtons = function (stateName, args) {
        //console.log( 'onUpdateActionButtons: '+stateName );
        this.removeActionButtons();
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                    if (args.canCollect) {
                        this.addActionButton('collectHerd_button', _('Collect herd'), 'onCollectHerd');
                    }
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    /*
    
        Here, you can defines some utility methods that you can use everywhere in your javascript
        script.
    
    */
    Mow.prototype.setSlowpokeWeight = function (slowpokeId, slowpokeNumber) {
        var keys = Object.keys(this.theHerd.item_type).filter(function (key) { return key % 100 == slowpokeNumber; });
        var lastKey = keys[keys.length - 1];
        var lastKeyItemWeight = this.theHerd.item_type[lastKey].weight;
        this.theHerd.item_type[slowpokeId].weight = lastKeyItemWeight + 1;
    };
    Mow.prototype.playCardOnTable = function (playerId, card, slowpokeNumber) {
        if (slowpokeNumber != -1) {
            this.setSlowpokeWeight(this.mowCards.getCardUniqueId(card.type, card.number), slowpokeNumber);
        }
        if (playerId != this.player_id) {
            // Some opponent played a card
            // Move card from player panel
            this.addCardToHerd(card, 'playertable-' + playerId);
        }
        else {
            // You played a card. Move card from the hand and remove corresponding item
            this.addCardToHerd(card, 'myhand_item_' + card.id);
            this.playerHand.removeFromStockById('' + card.id);
        }
    };
    ///////////////////////////////////////////////////
    //// Player's action
    /*
    
        Here, you are defining methods to handle player's action (ex: results of mouse click on
        game objects).
        
        Most of the time, these methods:
        _ check the action is possible at this game state.
        _ make a call to the game server
    
    */
    Mow.prototype.onCollectHerd = function () {
        if (!this.checkAction('collectHerd'))
            return;
        this.takeAction("collectHerd");
    };
    Mow.prototype.onKeepDirection = function () {
        if (!this.checkAction('setDirection'))
            return;
        this.takeAction("setDirection", {
            change: false
        });
    };
    Mow.prototype.onChangeDirection = function () {
        if (!this.checkAction('setDirection'))
            return;
        this.takeAction("setDirection", {
            change: true
        });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your mow.game.php file.
    
    */
    Mow.prototype.setupNotifications = function () {
        //console.log( 'notifications subscriptions setup' );
        dojo.subscribe('newHand', this, "notif_newHand");
        dojo.subscribe('cardPlayed', this, "notif_cardPlayed");
        dojo.subscribe('newCard', this, "notif_newCard");
        dojo.subscribe('allowedCards', this, "notif_allowedCards");
        dojo.subscribe('directionChanged', this, "notif_directionChanged");
        dojo.subscribe('herdCollected', this, "notif_herdCollected");
        dojo.subscribe('handCollected', this, "notif_handCollected");
        this.notifqueue.setSynchronous('herdCollected', 2000);
        this.notifqueue.setSynchronous('handCollected', 1500);
    };
    // TODO: from this point and below, you can write your game notifications handling methods
    Mow.prototype.notif_newHand = function (notif) {
        //console.log( 'notif_newHand', notif );
        var _this = this;
        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();
        notif.args.cards.forEach(function (card) { return _this.addCardToHand(card); });
        this.setRemainingCards(notif.args.remainingCards);
    };
    Mow.prototype.notif_cardPlayed = function (notif) {
        //console.log( 'notif_cardPlayed', notif );
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        this.playCardOnTable(notif.args.player_id, {
            id: notif.args.card_id,
            type: notif.args.color,
            number: notif.args.number
        }, notif.args.slowpokeNumber);
        this.setRemainingCards(notif.args.remainingCards);
    };
    Mow.prototype.notif_allowedCards = function (notif) {
        // console.log( 'notif_allowedCards', notif );            
        this.enableAllowedCards(notif.args.allowedCardsIds);
    };
    Mow.prototype.notif_newCard = function (notif) {
        //console.log( 'notif_newCard', notif );
        var _this = this;
        var card = notif.args.card;
        setTimeout(function () {
            // timeout so new card appear after played card animation
            _this.addCardToHand(card, 'remainingCards');
            if (_this.allowedCardsIds && _this.allowedCardsIds.indexOf(card.id) === -1) {
                dojo.query("#myhand_item_" + card.id).addClass("disabled");
            }
        }, 1000);
    };
    Mow.prototype.notif_directionChanged = function (notif) {
        //console.log( 'notif_directionChanged', notif );
        dojo.toggleClass('direction-play-symbol', 'direction-anticlockwise', !notif.args.direction_clockwise);
        dojo.removeClass("direction-animation-symbol");
        dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
    };
    Mow.prototype.notif_herdCollected = function (notif) {
        //console.log( 'notif_herdCollected', notif );
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        this.displayScoring('playertable-' + notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
        this.theHerd.removeAllTo('player_board_' + notif.args.player_id);
        dojo.query("#myhand .stockitem").removeClass("disabled");
        this.allowedCardsIds = null;
        this.playerHand.unselectAll();
    };
    Mow.prototype.notif_handCollected = function (notif) {
        // console.log( 'notif_handCollected', notif );
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        this.displayScoring('playertable-' + notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
        if (this.player_id == notif.args.player_id) {
            dojo.query("#myhand").removeClass("bounce");
            dojo.query("#myhand").addClass("bounce");
        }
        this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
    };
    ////////////////////////////////
    ////////////////////////////////
    /////    Cards selection    ////
    ////////////////////////////////
    ////////////////////////////////
    Mow.prototype.onPlayerHandSelectionChanged = function () {
        var items = this.playerHand.getSelectedItems();
        if (items.length == 1) {
            if (this.checkAction('playCard', true)) {
                // Can play a card
                var card_id = items[0].id; //items[0].type
                this.takeAction("playCard", {
                    'card_id': card_id,
                    'lock': true
                });
                this.playerHand.unselectAll();
            }
        }
    };
    ////////////////////////////////
    ////////////////////////////////
    /////////    Utils    //////////
    ////////////////////////////////
    ////////////////////////////////
    Mow.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/mow/mow/" + action + ".html", data, this, function () { });
    };
    Mow.prototype.setRemainingCards = function (remainingCards) {
        var $remainingCards = $('remainingCards');
        $remainingCards.innerHTML = remainingCards;
        dojo.style($remainingCards, "color", remainingCards > 5 ? null : this.remainingCardsColors[remainingCards]);
    };
    Mow.prototype.enableAllowedCards = function (allowedCardsIds) {
        var _this = this;
        this.allowedCardsIds = allowedCardsIds;
        this.playerHand.items.map(function (item) { return Number(item.id); }).forEach(function (id) {
            try {
                var disallowed = allowedCardsIds.indexOf(id) === -1;
                dojo.toggleClass('myhand_item_' + id, 'disabled', disallowed);
                if (disallowed) {
                    _this.playerHand.unselectItem('' + id);
                }
            }
            catch (e) { }
        });
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Mow.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.displayedColor !== undefined) {
                    args.displayedColor = this.colors[Number(args.displayedColor)];
                    args.displayedNumber = dojo.string.substitute("<strong style='color: ${displayedColor}'>${displayedNumber}</strong>", { 'displayedColor': args.displayedColor, 'displayedNumber': args.displayedNumber });
                }
                // symbol for special cards
                if (args.precision && args.precision !== '') {
                    if (args.precision === 'slowpoke') {
                        args.precision = '<span class="log-arrow rotate270"></span><span class="log-arrow rotate90"></span>';
                    }
                    else if (args.precision === 'acrobatic') {
                        args.precision = '<span class="log-arrow rotate180"></span>';
                    }
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    Mow.prototype.setupNewCard = function (card_div, card_type_id, card_id) {
        this.addTooltip(card_div.id, this.mowCards.getTooltip(card_type_id), '');
    };
    Mow.prototype.getNextPlayer = function () {
        var activePlayerId = this.getActivePlayerId();
        var activePlayerIndex = this.gamedatas.playerorder.findIndex(function (playerId) { return '' + playerId === activePlayerId; });
        var nextPlayerIndex = activePlayerIndex >= this.gamedatas.playerorder.length - 1 ? 0 : activePlayerIndex + 1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[nextPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[nextPlayerIndex])];
    };
    Mow.prototype.getPreviousPlayer = function () {
        var activePlayerId = this.getActivePlayerId();
        var activePlayerIndex = this.gamedatas.playerorder.findIndex(function (playerId) { return '' + playerId === activePlayerId; });
        var previousPlayerIndex = activePlayerIndex === 0 ? this.gamedatas.playerorder.length - 1 : activePlayerIndex - 1;
        //return this.gamedatas.players.find(player => player.id === ''+this.gamedatas.playerorder[previousPlayerIndex]);
        return this.gamedatas.players[Number(this.gamedatas.playerorder[previousPlayerIndex])];
    };
    Mow.prototype.addCardToStock = function (stock, card, from) {
        stock.addToStockWithId(this.mowCards.getCardUniqueId(card.type, card.number), '' + card.id, from);
    };
    Mow.prototype.addCardToHand = function (card, from) {
        this.addCardToStock(this.playerHand, card, from);
    };
    Mow.prototype.addCardToHerd = function (card, from) {
        this.addCardToStock(this.theHerd, card, from);
    };
    return Mow;
}());
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
//declare const define;
//declare const ebg;
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.mow", ebg.core.gamegui, new Mow());
});
