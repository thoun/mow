function slideToObjectAndAttach(game, object, destinationId, posX, posY) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }
    object.style.zIndex = '10';
    var animation = (posX || posY) ?
        game.slideToObjectPos(object, destinationId, posX, posY) :
        game.slideToObject(object, destinationId);
    dojo.connect(animation, 'onEnd', dojo.hitch(this, function () {
        object.style.top = 'unset';
        object.style.left = 'unset';
        object.style.position = 'relative';
        object.style.zIndex = 'unset';
        destination.appendChild(object);
    }));
    animation.play();
}
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
                var _a;
                var acrobaticDisplayedNumber = (_this.items[acrobaticNumber].type / 10) % 10;
                var matchingItemIndex = _this.items.findIndex(function (item) { return item.type % 10 === acrobaticDisplayedNumber; });
                //console.log('iAcrobatic: ',iAcrobatic, 'acrobaticDisplayedNumber', acrobaticDisplayedNumber, 'matchingItemIndex', matchingItemIndex);
                var item = _this.items[acrobaticNumber];
                if (typeof item.loc == "undefined") {
                    topDestination = iRow * (itemHeight + itemMargin);
                    topDestinations[acrobaticNumber] = topDestination;
                    leftDestinations[acrobaticNumber] = (_a = (matchingItemIndex === -1 ? 0 : leftDestinations[matchingItemIndex])) !== null && _a !== void 0 ? _a : 0;
                    zIndexes[acrobaticNumber] = 0;
                }
            });
        }
    });
    for (var i in this.items) {
        topDestination = topDestinations[i];
        leftDestination = leftDestinations[i];
        //console.log(i, leftDestinations, leftDestination);
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
                tooltip += _("<strong>Flanker cow:</strong> Play this cow to close off one end of the line.");
                break;
            case 570:
            case 590:
                tooltip += _("<strong>Acrobatic cow:</strong> Play this cow on another cow with the same number, no matter where it is in the line (this card cannot be played unless the requisite cow has been played previously).");
                break;
            case 521:
            case 522:
                tooltip += _("<strong>Slowpoke:</strong> Insert this cow into the line in place of a missing number (this card cannot be placed if there are no gaps in the line numbering).");
                break;
        }
        return tooltip;
    };
    MowCards.prototype.setupNewCard = function (game, card_div, card_type_id) {
        game.addTooltipHtml(card_div.id, this.getTooltip(card_type_id));
    };
    return MowCards;
}());
var FarmerCards = /** @class */ (function () {
    function FarmerCards() {
    }
    FarmerCards.prototype.createCards = function (stocks) {
        var cardsurl = g_gamethemeurl + "img/farmers.jpg";
        stocks.forEach(function (stock) {
            for (var number = 1; number <= 10; number++) {
                stock.addItemType(number, number, cardsurl, number - 1);
            }
        });
    };
    FarmerCards.prototype.getTooltip = function (cardTypeId) {
        var tooltip = '';
        switch (cardTypeId) {
            case 1:
                tooltip += _("The next player cannot play a special cow.");
                break;
            case 2:
                tooltip += _("Pick an opponent and look at their cards.");
                break;
            case 3:
                tooltip += _("Randomly pick a card from an opponent’s hand and then give them any card from your hand (or return their original card).");
                break;
            case 4:
                tooltip += _("Skip your turn.");
                break;
            case 5:
                tooltip += _("Discard the current herd without adding it to anyone’s cowshed. Begin a new herd.");
                break;
            case 6:
                tooltip += _("Draw 2 Farmer cards.");
                break;
            case 7:
                tooltip += _("Discard any cows with the values 7, 8 and 9 from your hand. Draw the same number of cards from the draw pile to replace them. (You cannot perform this action if there are not enough cards in the draw pile).");
                break;
            case 8:
                tooltip += _("At the end of your turn, either switch the direction of play OR choose which opponent plays next.");
                break;
            case 9:
                tooltip += _("Randomly pick a Cow card from each opponent’s hand and discard it without looking at it. Your opponents must play with one less card until the end of the round.");
                break;
            case 10:
                tooltip += "<strong>" + _("EXCEPTIONALLY, THIS CARD IS PLAYED WHEN CALCULATING THE SCORE FOR THE ROUND:") + "</strong> " + _("Pick a cow category (for example, «flankers»). Ignore all flies in that category when scoring.");
                break;
        }
        return tooltip;
    };
    FarmerCards.prototype.setupNewCard = function (game, card_div, card_type_id) {
        game.addTooltipHtml(card_div.id, this.getTooltip(card_type_id));
    };
    return FarmerCards;
}());
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var Mow = /** @class */ (function () {
    function Mow() {
        this.cardCounters = [];
        this.farmerCardCounters = [];
        this.playerHand = null;
        this.playerFarmerHand = null;
        this.theHerds = [];
        this.cardwidth = 121;
        this.cardheight = 188;
        this.playersSelectable = false;
        this.selectedPlayerId = null;
        this.pickCardAction = 'play';
        this.colors = [
            '#b5b5b5',
            '#a4d6e3',
            '#e98023',
            '#0096d9',
            null,
            '#000000'
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
        this.farmerCards = new FarmerCards();
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
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        // Place payer zone
        this.players = gamedatas.players;
        this.playerNumber = Object.keys(this.players).length;
        var ids = Object.keys(this.players);
        var playerId = gamedatas.current_player_id;
        if (!ids.includes(playerId)) {
            playerId = ids[0];
        }
        var isTwoPlayers = Object.keys(gamedatas.players).length == 2;
        var bottomPlayers = this.playerNumber === 5 ? 2 : 1;
        var alreadyPlacedOneTop = false;
        var alreadyPlacedOneBottom = false;
        for (var i = 1; i <= this.playerNumber; i++) {
            var player = this.players[playerId];
            var html = "<div id=\"playertable-" + playerId + "\" class=\"playertable\" data-id=\"" + playerId + "\">\n              <div class=\"playertablename\" style=\"color:#" + player.color + "\" data-id=\"" + playerId + "\" title=\"" + player.name + "\">\n                " + (player.name.length > 10 ? player.name.substr(0, 10) + "..." : player.name) + "\n              </div>\n            </div>";
            var row = i > bottomPlayers ? 'toprowplayers' : 'bottomrowplayers';
            if (alreadyPlacedOneTop && i > bottomPlayers) {
                dojo.place("<div class=\"between-players-arrow top " + (this.gamedatas.direction_clockwise ? '' : 'direction-anticlockwise') + "\"></div>", row);
            }
            if (alreadyPlacedOneBottom && i <= bottomPlayers) {
                dojo.place("<div class=\"between-players-arrow bottom " + (this.gamedatas.direction_clockwise ? '' : 'direction-anticlockwise') + "\"></div>", row);
            }
            dojo.place(html, row);
            playerId = gamedatas.next_players_id[playerId];
            if (!isTwoPlayers) {
                if (i > bottomPlayers) {
                    alreadyPlacedOneTop = true;
                }
                else {
                    alreadyPlacedOneBottom = true;
                }
            }
        }
        if (isTwoPlayers) {
            dojo.style('direction-text', 'display', 'none');
        }
        // Set up your game interface here, according to "gamedatas"
        this.playerHand = new ebg.stock();
        this.playerHand.create(this, $('myhand'), this.cardwidth, this.cardheight);
        this.playerHand.setSelectionMode(1);
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = function (card_div, card_type_id) { return _this.mowCards.setupNewCard(_this, card_div, card_type_id); };
        dojo.connect(this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged');
        var _loop_1 = function (iHerd) {
            if (iHerd > 0) {
                dojo.place("<hr/>", 'theherds');
            }
            dojo.place("<div class=\"row\">" + (gamedatas.herdNumber > 1 ? "<div id=\"rowIndicatorWrapper" + iHerd + "\" class=\"rowIndicatorWrapper\"></div>" : '') + "<div id=\"herd" + iHerd + "\" class=\"herd\"></div></div>", 'theherds');
            this_1.theHerds[iHerd] = new ebg.stock();
            this_1.theHerds[iHerd].create(this_1, $("herd" + iHerd), this_1.cardwidth, this_1.cardheight);
            this_1.theHerds[iHerd].setSelectionMode(0);
            this_1.theHerds[iHerd].centerItems = true;
            this_1.theHerds[iHerd].onItemCreate = function (card_div, card_type_id) { return _this.mowCards.setupNewCard(_this, card_div, card_type_id); };
            this_1.theHerds[iHerd].acrobatic_overlap = 45;
            this_1.theHerds[iHerd].updateDisplay = function (from) { return updateDisplay.apply(_this.theHerds[iHerd], [from]); };
            this_1.theHerds[iHerd].isAcrobatic = function (stockItemId) { return isAcrobatic.apply(_this.theHerds[iHerd], [stockItemId]); };
        };
        var this_1 = this;
        for (var iHerd = 0; iHerd < gamedatas.herdNumber; iHerd++) {
            _loop_1(iHerd);
        }
        this.mowCards.createCards(__spreadArrays(this.theHerds, [this.playerHand]));
        this.playerFarmerHand = new ebg.stock();
        this.playerFarmerHand.create(this, $('myfarmers'), this.cardwidth, this.cardheight);
        this.playerFarmerHand.setSelectionMode(1);
        this.playerFarmerHand.setSelectionAppearance('class');
        this.playerFarmerHand.selectionClass = 'no-visible-selection';
        this.playerFarmerHand.centerItems = true;
        this.playerFarmerHand.onItemCreate = function (card_div, card_type_id) { return _this.farmerCards.setupNewCard(_this, card_div, card_type_id); };
        dojo.connect(this.playerFarmerHand, 'onChangeSelection', this, 'onPlayerFarmerHandSelectionChanged');
        this.farmerCards.createCards([this.playerFarmerHand]);
        if (this.isSimpleVersion()) {
            dojo.style(('myfarmers'), "display", "none");
        }
        // Cards in player's hand
        this.gamedatas.hand.forEach(function (card) { return _this.addCardToHand(card); });
        this.gamedatas.farmerHand.forEach(function (card) { return _this.addFarmerCardToHand(card); });
        var _loop_2 = function (iHerd) {
            this_2.gamedatas.herds[iHerd].forEach(function (card) {
                var cardUniqueId = _this.mowCards.getCardUniqueId(card.type, card.number);
                if (card.slowpokeNumber) {
                    _this.setSlowpokeWeight(cardUniqueId, card.slowpokeNumber);
                }
                _this.addCardToHerd(card, iHerd);
            });
        };
        var this_2 = this;
        // Cards played on table
        for (var iHerd = 0; iHerd < gamedatas.herdNumber; iHerd++) {
            _loop_2(iHerd);
        }
        this.setRemainingCards(this.gamedatas.remainingCards);
        if (this.gamedatas.herdNumber == 1) {
            this.enableAllowedCards(this.gamedatas.allowedCardsIds);
        }
        if (!this.gamedatas.direction_clockwise) {
            dojo.addClass('direction-play-symbol', 'direction-anticlockwise');
        }
        dojo.connect($('keepDirectionButton'), 'onclick', this, 'onKeepDirection');
        dojo.connect($('changeDirectionButton'), 'onclick', this, 'onChangeDirection');
        Object.keys(gamedatas.players).forEach(function (playerId) { return dojo.connect($("playertable-" + playerId), 'onclick', _this, 'onPlayerSelection'); });
        if (gamedatas.herdNumber > 1) {
            dojo.place("<div id=\"rowIndicator\"><div id=\"rowIndicatorBackground\" class=\"" + (!this.gamedatas.direction_clockwise ? 'inverse' : '') + "\"></div></div>", "rowIndicatorWrapper" + gamedatas.activeRow);
        }
        // Setup game notifications to handle (see "setupNotifications" method below)
        log('setupNotifications');
        this.setupNotifications();
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Mow.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        log('Entering state: ' + stateName, args);
        if (this.isCurrentPlayerActive()) {
            dojo.addClass("playertable-" + args.active_player, "active");
        }
        switch (stateName) {
            case 'newHand':
                Object.keys(this.gamedatas.players).forEach(function (playerId) { return _this.cardCounters[playerId].toValue(5); });
                break;
            case 'playerTurn':
                var suffix = args.args.suffix;
                this.setGamestateDescription(suffix);
                this.onEnteringStatePlayerTurn(args);
                if (this.isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCards.map(function (card) { return card.id; }));
                }
                break;
            case 'chooseDirection':
                this.onEnteringStateChooseDirection(args.args);
                break;
            case 'playFarmer':
                if (this.isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCards.map(function (card) { return card.id; }));
                }
                break;
            case 'swapHands':
                this.onEnteringSelectionAction();
                if (this.isCurrentPlayerActive() && args.args.opponentId) {
                    this.selectPlayer(args.args.opponentId);
                }
                break;
            case 'selectOpponent':
                this.onEnteringSelectionAction();
                break;
            case 'viewCards':
                this.onEnteringViewCards(args.args, this.isCurrentPlayerActive());
                break;
            case 'giveCard':
                if (this.isCurrentPlayerActive()) {
                    this.setPickCardAction('give');
                }
                break;
            case 'endHand':
                for (var iHerd = 0; iHerd < this.gamedatas.herdNumber; iHerd++) {
                    this.theHerds[iHerd].removeAllTo('topbar');
                }
                break;
        }
    };
    Mow.prototype.onEnteringStatePlayerTurn = function (args) {
        var _this = this;
        var _a;
        if (this.isCurrentPlayerActive()) {
            this.setPickCardAction('play');
            this.enableAllowedCards(args.args.allowedCardIds);
        }
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
            var herdSelector = this.gamedatas.herdNumber > 1;
            dojo.toggleClass('keepDirectionSymbol', 'direction-anticlockwise', !args.direction_clockwise);
            dojo.toggleClass('changeDirectionSymbol', 'direction-anticlockwise', args.direction_clockwise);
            this.setPick(args.canPick);
            if (herdSelector) {
                Array.from(document.getElementsByClassName('label-next-player')).forEach(function (span) { return span.innerHTML = _('Next herd'); });
                var downRow = (this.gamedatas.activeRow + 1) % this.gamedatas.herdNumber;
                var upRow = (this.gamedatas.activeRow + this.gamedatas.herdNumber - 1) % this.gamedatas.herdNumber;
                var keepDirectionRow = args.direction_clockwise ? downRow : upRow;
                var changeDirectionRow = args.direction_clockwise ? upRow : downRow;
                $("keepDirectionNextPlayer").innerHTML = dojo.string.substitute(_("Herd ${number}"), { 'number': keepDirectionRow + 1 });
                $("changeDirectionNextPlayer").innerHTML = dojo.string.substitute(_("Herd ${number}"), { 'number': changeDirectionRow + 1 });
                document.getElementById('keepDirectionSymbol').classList.add('straight');
                document.getElementById('changeDirectionSymbol').classList.add('straight');
                dojo.toggleClass('keepDirectionSymbol', 'reverse-arrow', !args.direction_clockwise);
                dojo.toggleClass('changeDirectionSymbol', 'reverse-arrow', args.direction_clockwise);
            }
            else {
                var keepDirectionNextPlayer = args.direction_clockwise ? this.getPreviousPlayer() : this.getNextPlayer();
                var changeDirectionNextPlayer = args.direction_clockwise ? this.getNextPlayer() : this.getPreviousPlayer();
                $("keepDirectionNextPlayer").innerHTML = keepDirectionNextPlayer.name;
                $("changeDirectionNextPlayer").innerHTML = changeDirectionNextPlayer.name;
                dojo.style('keepDirectionNextPlayer', 'color', '#' + keepDirectionNextPlayer.color);
                dojo.style('changeDirectionNextPlayer', 'color', '#' + changeDirectionNextPlayer.color);
            }
            dojo.style('direction_popin', 'display', 'flex');
            dojo.toggleClass('direction_popin', 'swap', !args.direction_clockwise);
        }
    };
    Mow.prototype.onEnteringSelectionAction = function () {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            this.playersSelectable = true;
            Object.keys(this.gamedatas.players).filter(function (playerId) { return Number(playerId) !== Number(_this.player_id); }).forEach(function (playerId) {
                return dojo.addClass("playertable-" + playerId, 'selectable');
            });
        }
    };
    Mow.prototype.onEnteringViewCards = function (args, isActivePlayer) {
        var _this = this;
        var opponent = this.getPlayer(args.opponentId);
        var opponentCardsDiv = document.getElementById('opponent-animals');
        opponentCardsDiv.innerHTML = '';
        document.getElementById('opponent-hand-label').innerHTML = dojo.string.substitute(_("${player_name} cards"), { player_name: "<span style=\"color: #" + opponent.color + "\">" + opponent.name + "</span>" });
        var opponentHandWrap = document.getElementById('opponent-hand-wrap');
        opponentHandWrap.classList.remove('hidden');
        opponentHandWrap.style.boxShadow = "0 0 3px 3px #" + opponent.color;
        opponentCardsDiv.classList.toggle('text', !isActivePlayer);
        if (isActivePlayer) {
            var opponentHand_1 = new ebg.stock();
            opponentHand_1.create(this, $('opponent-animals'), this.cardwidth, this.cardheight);
            opponentHand_1.setSelectionMode(0);
            opponentHand_1.centerItems = true;
            opponentHand_1.onItemCreate = function (cardDiv, type) { return _this.mowCards.setupNewCard(_this, cardDiv, type); };
            this.mowCards.createCards([opponentHand_1]);
            args.cards.forEach(function (card) { return _this.addCardToStock(opponentHand_1, card); });
        }
        else {
            var active = this.getPlayer(Number(this.getActivePlayerId()));
            document.getElementById('opponent-animals').innerHTML = '<div>' + dojo.string.substitute(_("${active_player_name} is looking at ${player_name} cards"), {
                active_player_name: "<span style=\"color: #" + active.color + "\">" + active.name + "</span>",
                player_name: "<span style=\"color: #" + opponent.color + "\">" + opponent.name + "</span>"
            }) + '</div>';
        }
    };
    Mow.prototype.setGamestateDescription = function (suffix) {
        if (suffix === void 0) { suffix = ''; }
        var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = "" + originalState['description' + suffix];
        this.gamedatas.gamestate.descriptionmyturn = "" + originalState['descriptionmyturn' + suffix];
        this.updatePageTitle();
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Mow.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        dojo.query(".playertable").removeClass("active");
        switch (stateName) {
            case 'playerTurn':
                if (this.isCurrentPlayerActive()) {
                    this.enableFarmerCards();
                    if (this.gamedatas.herdNumber > 1) {
                        this.resetAllowedCards();
                    }
                }
                break;
            case 'chooseDirection':
                dojo.style('direction_popin', 'display', 'none');
                break;
            case 'playFarmer':
                if (this.isCurrentPlayerActive()) {
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
    };
    Mow.prototype.onLeavingSelectionAction = function () {
        this.playersSelectable = false;
        Object.keys(this.gamedatas.players).forEach(function (playerId) {
            return dojo.removeClass("playertable-" + playerId, 'selectable');
        });
    };
    Mow.prototype.onLeavingStateViewCards = function () {
        var giraffeHandWrap = document.getElementById('opponent-hand-wrap');
        giraffeHandWrap.classList.add('hidden');
        giraffeHandWrap.style.boxShadow = '';
        document.getElementById('opponent-animals').innerHTML = '';
    };
    Mow.prototype.addAllowedFarmerCardsButtons = function (args) {
        var _this = this;
        args.allowedFarmerCards.forEach(function (card) {
            return _this.addActionButton("playFarmer" + card.id + "_button", _('Play farmer') + (" <div class=\"farmer-icon farmer" + card.type + "\"></div>"), function () { return _this.playFarmer(card.id); }, null, null, 'gray');
        });
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //        
    Mow.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        //log( 'onUpdateActionButtons: '+stateName );
        this.removeActionButtons();
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                    this.addAllowedFarmerCardsButtons(args);
                    if (args.canCollect) {
                        this.addActionButton('collectHerd_button', _('Collect herd'), 'onCollectHerd', null, false, 'red');
                    }
                    break;
                case 'playFarmer':
                    this.addAllowedFarmerCardsButtons(args);
                    this.addActionButton('pass_button', _('Pass'), 'onPassFarmer');
                    break;
                case 'swapHands':
                    this.addActionButton('dontSwapHands_button', _("Don't swap"), 'onDontSwap');
                    this.addActionButton('selectionAction_button', _("Swap"), 'onSwap');
                    dojo.addClass('selectionAction_button', 'disabled');
                    break;
                case 'selectOpponent':
                    if (args.lookOpponentHand) {
                        this.addActionButton('selectionAction_button', _("Look player's hand"), 'onLookHand');
                    }
                    else {
                        this.addActionButton('selectionAction_button', _("Pick a card"), 'onPickOpponentCard');
                    }
                    dojo.addClass('selectionAction_button', 'disabled');
                    break;
                case 'selectFliesType':
                    var selectFliesTypeArgs_1 = args;
                    [1, 2, 3, 5].forEach(function (type) {
                        return _this.addActionButton("flyType" + type + "_button", _this.getSelectFlyTypeDetailsLabel(type, selectFliesTypeArgs_1), function () { return _this.selectFlieType(type); }, null, null, selectFliesTypeArgs_1.counts[type].points ? undefined : 'gray');
                    });
                    this.addActionButton('flyTypeIgnore_button', _("Ignore"), function () { return _this.selectFlieType(0); }, null, false, 'red');
                    break;
                case 'viewCards':
                    this.addActionButton('seen-button', _('Seen'), function () { return _this.next(); });
                    break;
            }
        }
    };
    Mow.prototype.getSelectFlyTypeDetailsLabel = function (type, selectFliesTypeArgs) {
        var details = selectFliesTypeArgs.counts[type];
        return (type > 1 ? _('${number}-flies cards').replace('${number}', type) : _('1-fly cards')) + ' (' + _('ignore ${points} point(s)') /*.replace('${number}', details.number)*/.replace('${points}', details.points) + ')';
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    /*
    
        Here, you can defines some utility methods that you can use everywhere in your javascript
        script.
    
    */
    Mow.prototype.isSimpleVersion = function () {
        return this.gamedatas.simpleVersion;
    };
    Mow.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Mow.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    Mow.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            var html = "<div class=\"counters\">\n                <div id=\"card-counter-wrapper-" + player.id + "\" class=\"counter\">\n                    <div class=\"counter-icon card\"></div>\n                    <div class=\"player-hand-card\"></div> \n                    <span id=\"card-counter-" + player.id + "\"></span>\n                </div>";
            if (!gamedatas.simpleVersion) {
                html += "\n                    <div id=\"farmer-card-counter-wrapper-" + player.id + "\" class=\"counter\">\n                        <div class=\"counter-icon farmer-card\"></div>\n                        <div class=\"player-hand-card\"></div> \n                        <span id=\"farmer-card-counter-" + player.id + "\"></span>\n                    </div>";
            }
            html += "</div>";
            dojo.place(html, "player_board_" + player.id);
            var cardCounter = new ebg.counter();
            cardCounter.create("card-counter-" + playerId);
            cardCounter.setValue(player.cards);
            _this.cardCounters[playerId] = cardCounter;
            _this.addTooltipHtml("card-counter-wrapper-" + player.id, _("Number of cards in hand"));
            if (!gamedatas.simpleVersion) {
                var farmerCardCounter = new ebg.counter();
                farmerCardCounter.create("farmer-card-counter-" + playerId);
                farmerCardCounter.setValue(player.farmerCards);
                _this.farmerCardCounters[playerId] = farmerCardCounter;
                _this.addTooltipHtml("farmer-card-counter-wrapper-" + player.id, _("Number of farmer cards in hand"));
            }
            if (playerId == _this.getPlayerId()) {
                html = "\n                <div>\n                    <button class=\"bgabutton bgabutton_gray\" id=\"collected-button-" + player.id + "\" style=\"white-space: normal;\">" + _('See collected cards') + "</button>\n                </div>";
                dojo.place(html, "player_board_" + player.id);
                document.getElementById("collected-button-" + player.id).addEventListener('click', function () { return _this.showCollected(); });
            }
        });
    };
    Mow.prototype.showCollected = function () {
        var discardedDialog = new ebg.popindialog();
        discardedDialog.create('mowCollectedDialog');
        discardedDialog.setTitle('');
        var html = "<div id=\"collected-popin\">\n            <h1>" + _("Collected cards") + "</h1>\n            <div class=\"collected-cards\">";
        if (this.gamedatas.collectedCards.length) {
            var cards = this.gamedatas.collectedCards.slice();
            cards.sort(function (a, b) { return a.type == b.type ? a.number - b.number : b.type - a.type; });
            cards.forEach(function (card) { return html += "<div class=\"card\" data-type=\"" + card.type + "\" data-number=\"" + card.number + "\"></div>"; });
        }
        else {
            html += "<div class=\"message\">" + _('No collected cards on this round') + "</div>";
        }
        html += "</div>\n        </div>";
        // Show the dialog
        discardedDialog.setContent(html);
        discardedDialog.show();
    };
    Mow.prototype.setPickCardAction = function (pickCardAction) {
        if (this.pickCardAction == pickCardAction) {
            return;
        }
        this.playerHand.unselectAll();
        this.pickCardAction = pickCardAction;
    };
    Mow.prototype.setSlowpokeWeight = function (slowpokeId, slowpokeNumber) {
        for (var iHerd = 0; iHerd < this.gamedatas.herdNumber; iHerd++) {
            var keys = Object.keys(this.theHerds[iHerd].item_type).filter(function (key) { return key % 100 == slowpokeNumber; });
            var lastKey = keys[keys.length - 1];
            var lastKeyItemWeight = this.theHerds[iHerd].item_type[lastKey].weight;
            this.theHerds[iHerd].item_type[slowpokeId].weight = lastKeyItemWeight + 1;
        }
    };
    Mow.prototype.playCardOnTable = function (playerId, card, row, slowpokeNumber) {
        if (slowpokeNumber != -1) {
            this.setSlowpokeWeight(this.mowCards.getCardUniqueId(card.type, card.number), slowpokeNumber);
        }
        if (playerId != this.player_id) {
            // Some opponent played a card
            // Move card from player panel
            this.addCardToHerd(card, row, 'playertable-' + playerId);
        }
        else {
            // You played a card. Move card from the hand and remove corresponding item
            this.addCardToHerd(card, row, 'myhand_item_' + card.id);
            this.playerHand.removeFromStockById('' + card.id);
        }
    };
    Mow.prototype.setPick = function (canPick) {
        var _this = this;
        dojo.toggleClass('pickBlock', 'visible', canPick);
        document.getElementById('pickBlock').innerHTML = '';
        if (canPick) {
            var rowPick_1 = this.gamedatas.herdNumber > 1;
            var ids = rowPick_1 ? [0, 1, 2] : this.gamedatas.playerorder.map(function (id) { return Number(id); }).filter(function (id) { return id != Number(_this.player_id); });
            var html_1 = "<div>" + _('Or choose which opponent plays next:') + "</div>";
            ids.forEach(function (id) {
                var player = rowPick_1 ? {
                    color: 'transparent',
                    name: dojo.string.substitute(_("Herd ${number}"), { 'number': id + 1 }),
                } : _this.gamedatas.players[id];
                html_1 += "<button id=\"pickBtn" + id + "\" class=\"bgabutton bgabutton_blue pickButton\" style=\"border: 3px solid #" + player.color + "\">" + player.name + "</button>";
            });
            document.getElementById('pickBlock').innerHTML = html_1;
            ids.forEach(function (id) { return document.getElementById("pickBtn" + id).addEventListener('click', function () { return _this.pickPlayer(id); }); });
        }
    };
    Mow.prototype.disableFarmerCards = function (allowedFarmerCardIds) {
        this.playerFarmerHand.items.map(function (item) { return Number(item.id); }).forEach(function (id) {
            try {
                dojo.toggleClass('myfarmers_item_' + id, 'disabled', allowedFarmerCardIds.indexOf(id) === -1);
            }
            catch (e) { }
        });
    };
    Mow.prototype.enableFarmerCards = function () {
        this.playerFarmerHand.items.map(function (item) { return Number(item.id); }).forEach(function (id) {
            try {
                dojo.removeClass('myfarmers_item_' + id, 'disabled');
            }
            catch (e) { }
        });
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
    Mow.prototype.onPlayerSelection = function (event) {
        if (!this.playersSelectable) {
            return;
        }
        // TODO check player has cards to select
        var playerId = Number(event.target.dataset.id);
        if (playerId === this.player_id) {
            return;
        }
        this.selectPlayer(playerId);
    };
    Mow.prototype.selectPlayer = function (playerId) {
        if (this.selectedPlayerId) {
            dojo.removeClass("playertable-" + this.selectedPlayerId, 'selected');
        }
        else {
            // first selection, we add action button
            dojo.removeClass('selectionAction_button', 'disabled');
        }
        this.selectedPlayerId = playerId;
        dojo.addClass("playertable-" + playerId, 'selected');
    };
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
    Mow.prototype.pickPlayer = function (id) {
        if (!this.checkAction('setPlayer'))
            return;
        this.takeAction("setPlayer", {
            id: id
        });
    };
    Mow.prototype.onPassFarmer = function () {
        if (!this.checkAction('pass'))
            return;
        this.takeAction("pass");
    };
    Mow.prototype.onSwap = function () {
        if (!this.checkAction('swap'))
            return;
        this.takeAction("swap", {
            playerId: this.selectedPlayerId
        });
        this.selectedPlayerId = null;
    };
    Mow.prototype.onDontSwap = function () {
        if (!this.checkAction('dontSwap'))
            return;
        this.takeAction("swap", {
            playerId: 0
        });
    };
    Mow.prototype.onLookHand = function () {
        if (!this.checkAction('viewCards'))
            return;
        this.takeAction("viewCards", {
            playerId: this.selectedPlayerId
        });
        this.selectedPlayerId = null;
    };
    Mow.prototype.onPickOpponentCard = function () {
        if (!this.checkAction('exchangeCard'))
            return;
        this.takeAction("exchangeCard", {
            playerId: this.selectedPlayerId
        });
        this.selectedPlayerId = null;
    };
    Mow.prototype.next = function () {
        if (!this.checkAction('next'))
            return;
        this.takeAction("next");
    };
    Mow.prototype.selectFlieType = function (type) {
        if (!this.checkAction('ignoreFlies'))
            return;
        this.takeAction("ignoreFlies", {
            playerId: type === null ? 0 : this.player_id,
            type: type
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
        var _this = this;
        log('notifications subscriptions setup');
        var notifs = [
            ['newHand', 500],
            ['cardPlayed', 500],
            ['farmerCardPlayed', 3000],
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
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    // from this point and below, you can write your game notifications handling methods
    Mow.prototype.notif_newHand = function (notif) {
        var _this = this;
        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();
        notif.args.cards.forEach(function (card) { return _this.addCardToHand(card); });
        if (notif.args.remainingCards) {
            this.setRemainingCards(notif.args.remainingCards);
        }
    };
    Mow.prototype.notif_cardPlayed = function (notif) {
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        this.playCardOnTable(notif.args.player_id, notif.args.card, notif.args.row, notif.args.slowpokeNumber);
        this.setRemainingCards(notif.args.remainingCards);
        this.cardCounters[notif.args.player_id].incValue(-1);
    };
    Mow.prototype.notif_farmerCardPlayed = function (notif) {
        this.playerFarmerHand.removeFromStockById('' + notif.args.card.id);
        this.farmerCardCounters[notif.args.player_id].incValue(-1);
        var player = this.getPlayer(notif.args.player_id);
        document.getElementById("farmer-animation-text").innerHTML = _(notif.log).replace('${farmerCardType}', '').replace('${player_name}', "<strong style=\"color: #" + player.color + ";\">" + player.name + "</strong>");
        document.getElementById("farmer-animation-image").dataset.type = '' + notif.args.card.type;
        document.getElementById("farmer-animation-description").innerHTML = this.farmerCards.getTooltip(notif.args.card.type);
        var wrapper = document.getElementById("farmer-animation-wrapper");
        wrapper.style.opacity = '1';
        setTimeout(function () { return wrapper.style.opacity = '0'; }, 3000);
    };
    Mow.prototype.notif_allowedCards = function (notif) {
        if (this.gamedatas.herdNumber == 1) {
            this.enableAllowedCards(notif.args.allowedCardsIds);
        }
    };
    Mow.prototype.notif_newCard = function (notif) {
        var _this = this;
        var card = notif.args.card;
        setTimeout(function () {
            // timeout so new card appear after played card animation
            _this.addCardToHand(card, notif.args.fromPlayerId ? 'playertable-' + notif.args.fromPlayerId : 'remainingCards');
            if (notif.args.allowedCardsIds && notif.args.allowedCardsIds.indexOf(card.id) === -1) {
                dojo.query("#myhand_item_" + card.id).addClass("disabled");
            }
        }, 500);
    };
    Mow.prototype.notif_newCardUpdateCounter = function (notif) {
        this.cardCounters[notif.args.playerId].incValue(1);
    };
    Mow.prototype.notif_newFarmerCard = function (notif) {
        var card = notif.args.card;
        this.addFarmerCardToHand(card);
    };
    Mow.prototype.notif_newFarmerCardUpdateCounter = function (notif) {
        this.farmerCardCounters[notif.args.playerId].incValue(1);
    };
    Mow.prototype.notif_directionChanged = function (notif) {
        if (this.gamedatas.herdNumber > 1) {
            dojo.toggleClass('direction-play-symbol', 'reverse-arrow', !notif.args.direction_clockwise);
        }
        else {
            dojo.toggleClass('direction-play-symbol', 'direction-anticlockwise', !notif.args.direction_clockwise);
            Array.from(document.getElementsByClassName('between-players-arrow')).forEach(function (elem) { return elem.classList.toggle('direction-anticlockwise', !notif.args.direction_clockwise); });
        }
        dojo.removeClass("direction-animation-symbol");
        if (this.gamedatas.herdNumber > 1) {
            document.getElementById('direction-animation-symbol').classList.add('straight');
            dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "upToDown" : "downToUp");
        }
        else {
            dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
        }
        if (this.gamedatas.herdNumber > 1) {
            dojo.toggleClass('rowIndicatorBackground', 'inverse', !notif.args.direction_clockwise);
        }
    };
    Mow.prototype.notif_herdCollected = function (notif) {
        var _a;
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        if (notif.args.player_id) {
            this.displayScoring('playertable-' + notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            this.scoreCtrl[notif.args.player_id].toValue(notif.args.playerScore);
            this.theHerds[notif.args.row].removeAllTo('player_board_' + notif.args.player_id);
        }
        else {
            this.theHerds[notif.args.row].removeAllTo('topbar');
        }
        dojo.query("#myhand .stockitem").removeClass("disabled");
        this.allowedCardsIds = null;
        this.playerHand.unselectAll();
        if (Number(notif.args.player_id) == this.getPlayerId()) {
            (_a = this.gamedatas.collectedCards).push.apply(_a, notif.args.collectedCards);
        }
    };
    Mow.prototype.notif_handCollected = function (notif) {
        var _a;
        var _this = this;
        if (notif.args.points > 0) {
            this.displayScoring('playertable-' + notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            if (this.player_id == notif.args.player_id) {
                dojo.query("#myhand").removeClass("bounce");
                dojo.query("#myhand").addClass("bounce");
            }
            this.scoreCtrl[notif.args.player_id].toValue(notif.args.playerScore);
        }
        setTimeout(function () {
            if (_this.player_id == notif.args.player_id) {
                _this.playerHand.removeAll();
            }
            _this.cardCounters[notif.args.player_id].toValue(0);
        }, 1450);
        if (Number(notif.args.player_id) == this.getPlayerId()) {
            (_a = this.gamedatas.collectedCards).push.apply(_a, notif.args.collectedCards);
        }
    };
    Mow.prototype.notif_replaceCards = function (notif) {
        var _this = this;
        notif.args.oldCards.forEach(function (card) { return _this.playerHand.removeFromStockById('' + card.id); });
        notif.args.newCards.forEach(function (card) { return _this.addCardToHand(card, 'remainingCards'); });
    };
    Mow.prototype.notif_removedCard = function (notif) {
        this.playerHand.removeFromStockById('' + notif.args.card.id, notif.args.fromPlayerId ? 'playertable-' + notif.args.fromPlayerId : undefined);
    };
    Mow.prototype.notif_removedCardUpdateCounter = function (notif) {
        this.cardCounters[notif.args.playerId].incValue(-1);
    };
    Mow.prototype.notif_activeRowChanged = function (notif) {
        this.gamedatas.activeRow = notif.args.activeRow;
        slideToObjectAndAttach(this, $('rowIndicator'), "rowIndicatorWrapper" + notif.args.activeRow);
    };
    Mow.prototype.notif_tableWindow = function (notif) {
        var _this = this;
        Object.keys(notif.args.playersScores).forEach(function (playerId) {
            _this.scoreCtrl[playerId].toValue(Number(notif.args.playersScores[playerId]));
        });
        this.gamedatas.collectedCards = [];
    };
    ////////////////////////////////
    ////////////////////////////////
    /////    Cards selection    ////
    ////////////////////////////////
    ////////////////////////////////
    Mow.prototype.onPlayerHandSelectionChanged = function () {
        var items = this.playerHand.getSelectedItems();
        if (items.length == 1) {
            var card = items[0];
            var action = this.pickCardAction + 'Card';
            if (this.checkAction(action, true)) {
                this.takeAction(action, {
                    id: card.id
                });
                this.playerHand.unselectAll();
            }
        }
    };
    Mow.prototype.onPlayerFarmerHandSelectionChanged = function () {
        var items = this.playerFarmerHand.getSelectedItems();
        if (items.length == 1) {
            if (this.checkAction('playFarmer', true)) {
                // Can play a card
                var id = items[0].id;
                this.playFarmer(id);
                this.playerFarmerHand.unselectAll();
            }
        }
    };
    Mow.prototype.playFarmer = function (id) {
        this.takeAction("playFarmer", {
            id: id
        });
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
    Mow.prototype.resetAllowedCards = function () {
        this.allowedCardsIds = null;
        this.playerHand.items.map(function (item) { return Number(item.id); }).forEach(function (id) {
            try {
                dojo.toggleClass('myhand_item_' + id, 'disabled', false);
            }
            catch (e) { }
        });
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Mow.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                if (args.card && (typeof args.card_display !== 'string')) {
                    var card = args.card;
                    var displayedNumber = card.number;
                    var precision = null;
                    if (displayedNumber == 21 || displayedNumber == 22) {
                        displayedNumber = '';
                        precision = 'slowpoke';
                    }
                    else if (displayedNumber == 70 || displayedNumber == 90) {
                        displayedNumber /= 10;
                        precision = 'acrobatic';
                    }
                    args.card_display = "<strong style='color: " + this.colors[Number(card.type)] + "'>" + displayedNumber + "</strong>";
                    if (precision === 'slowpoke') {
                        args.card_display += '<span class="log-arrow rotate270"></span><span class="log-arrow rotate90"></span>';
                    }
                    else if (precision === 'acrobatic') {
                        args.card_display += '<span class="log-arrow"></span>';
                    }
                }
                if (args.farmerCardType && typeof args.farmerCardType !== 'string') {
                    args.farmerCardType = "\n                        <div class=\"log-farmer-card\" data-type=\"" + args.farmerCardType + "\"></div>\n                        <div>" + this.farmerCards.getTooltip(args.farmerCardType) + "</div>\n                    ";
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
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
    Mow.prototype.addCardToHerd = function (card, row, from) {
        this.addCardToStock(this.theHerds[row], card, from);
    };
    Mow.prototype.addFarmerCardToStock = function (stock, card, from) {
        stock.addToStockWithId(card.type, '' + card.id, from);
    };
    Mow.prototype.addFarmerCardToHand = function (card, from) {
        this.addFarmerCardToStock(this.playerFarmerHand, card, from);
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
