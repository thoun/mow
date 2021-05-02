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
                    zIndexes[iNotAcrobatic] = 0;
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
                    zIndexes[acrobaticNumber] = 1;
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
                tooltip += _("Le joueur suivant ne peut pas jouer de carte Vache Spéciale !");
                break;
            case 2:
                tooltip += _("Prenez connaissance des cartes de l’adversaire de votre choix.");
                break;
            case 3:
                tooltip += _("Piochez une carte dans la main d’un adversaire et rendez-lui la carte de votre choix (vous pouvez lui rendre la carte piochée).");
                break;
            case 4:
                tooltip += _("Passez votre tour.");
                break;
            case 5:
                tooltip += _("Défaussez le troupeau en cours. Personne ne l’accueille dans son étable. Commencez un nouveau troupeau.");
                break;
            case 6:
                tooltip += _("Piochez 2 cartes Fermier");
                break;
            case 7:
                tooltip += _("Défaussez de votre main les vaches de valeur 7, 8 et 9. Remplacez-les par autant de cartes de la pioche. (action impossible s’il ne reste pas assez de cartes dans la pioche).");
                break;
            case 8:
                tooltip += _("A la fin de votre tour, changez le sens du jeu OU passez la main à l’adversaire de votre choix");
                break;
            case 9:
                tooltip += _("Piochez une carte Vache au hasard dans la main de chaque adversaire et défaussez-la sans en prendre connaissance.");
                break;
            case 10:
                tooltip += _("EXCEPTION, CETTE CARTE SE JOUE AU MOMENT DU CALCUL DU SCORE DE LA MANCHE : choisissez une catégorie de vache. Vous ne totalisez pas les mouches de cette catégorie de vaches.");
                break;
        }
        return tooltip;
    };
    FarmerCards.prototype.setupNewCard = function (game, card_div, card_type_id) {
        game.addTooltipHtml(card_div.id, this.getTooltip(card_type_id));
    };
    return FarmerCards;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Mow = /** @class */ (function () {
    function Mow() {
        this.playerHand = null;
        this.playerFarmerHand = null;
        this.theHerds = [];
        this.cardwidth = 121;
        this.cardheight = 178;
        this.playersSelectable = false;
        this.selectedPlayerId = null;
        this.pickCardAction = 'play';
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
        // Set up your game interface here, according to "gamedatas"
        this.playerHand = new ebg.stock();
        this.playerHand.create(this, $('myhand'), this.cardwidth, this.cardheight);
        this.playerHand.setSelectionMode(1);
        this.playerHand.setSelectionAppearance('class');
        this.playerHand.centerItems = true;
        this.playerHand.onItemCreate = function (card_div, card_type_id) { return _this.mowCards.setupNewCard(_this, card_div, card_type_id); };
        dojo.connect(this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged');
        var _loop_1 = function (iHerd) {
            dojo.place("<div class=\"row\">" + (gamedatas.herdNumber > 1 ? "<div id=\"rowIndicatorWrapper" + iHerd + "\" class=\"rowIndicatorWrapper\"></div>" : '') + "<div id=\"herd" + iHerd + "\" class=\"herd\"></div></div>", 'theherds');
            this_1.theHerds[iHerd] = new ebg.stock();
            this_1.theHerds[iHerd].create(this_1, $("herd" + iHerd), this_1.cardwidth, this_1.cardheight);
            this_1.theHerds[iHerd].setSelectionMode(0);
            this_1.theHerds[iHerd].centerItems = true;
            this_1.theHerds[iHerd].acrobatic_overlap = 0;
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
        console.log('gamedatas', this.gamedatas);
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
            dojo.place("<div id=\"rowIndicator\"><div id=\"rowIndicatorBackground\" class=\"" + (!this.gamedatas.direction_clockwise ? 'inverse' : '') + "\"></div></div>", "rowIndicatorWrapper0");
        }
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
        if (this.isCurrentPlayerActive()) {
            dojo.addClass("playertable-" + args.active_player, "active");
        }
        switch (stateName) {
            case 'playerTurn':
                var suffix = args.args.suffix;
                this.setGamestateDescription(suffix);
                this.onEnteringStatePlayerTurn(args);
                if (this.isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCardIds);
                }
                break;
            case 'chooseDirection':
                this.onEnteringStateChooseDirection(args.args);
                break;
            case 'playFarmer':
                if (this.isCurrentPlayerActive()) {
                    this.disableFarmerCards(args.args.allowedFarmerCardIds);
                }
                break;
            case 'swapHands':
                this.onEnteringSelectionAction();
                break;
            case 'selectOpponent':
                this.onEnteringSelectionAction();
                break;
            case 'viewCards':
                this.onEnteringViewCards(args.args);
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
                document.getElementById('keepDirectionSymbol').innerHTML = '🠗';
                document.getElementById('changeDirectionSymbol').innerHTML = '🠗';
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
    Mow.prototype.onEnteringViewCards = function (args) {
        var _this = this;
        if (!this.isCurrentPlayerActive()) {
            return;
        }
        var viewCardsDialog = new ebg.popindialog();
        viewCardsDialog.create('mowViewCardsDialog');
        console.log(args, this.gamedatas.players[args.opponentId]);
        viewCardsDialog.setTitle(dojo.string.substitute(_(" ${player_name} cards"), { player_name: this.gamedatas.players[args.opponentId].name }));
        var html = "<div id=\"opponent-hand\"></div>";
        // Show the dialog
        viewCardsDialog.setContent(html);
        var opponentHand = new ebg.stock();
        opponentHand.create(this, $('opponent-hand'), this.cardwidth, this.cardheight);
        opponentHand.setSelectionMode(0);
        opponentHand.centerItems = true;
        opponentHand.onItemCreate = function (card_div, card_type_id) { return _this.mowCards.setupNewCard(_this, card_div, card_type_id); };
        this.mowCards.createCards([opponentHand]);
        args.cards.forEach(function (card) { return _this.addCardToStock(opponentHand, card); });
        viewCardsDialog.show();
        // Replace the function call when it's clicked
        viewCardsDialog.replaceCloseCallback(function () {
            if (!_this.checkAction('next'))
                return;
            _this.takeAction("next");
            viewCardsDialog.destroy();
        });
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
        //console.log( 'Leaving state: '+stateName ); 
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
            case 'dummmy':
                break;
        }
    };
    Mow.prototype.onLeavingSelectionAction = function () {
        this.playersSelectable = false;
        Object.keys(this.gamedatas.players).forEach(function (playerId) {
            return dojo.removeClass("playertable-" + playerId, 'selectable');
        });
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
                        this.addActionButton('collectHerd_button', _('Collect herd'), 'onCollectHerd', null, false, 'red');
                    }
                    break;
                case 'playFarmer':
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
                    this.addActionButton('flyType1_button', _("1 fly"), 'onSelectFlyType1');
                    this.addActionButton('flyType2_button', _("2 flies"), 'onSelectFlyType2');
                    this.addActionButton('flyType3_button', _("3 flies"), 'onSelectFlyType3');
                    this.addActionButton('flyType5_button', _("5 flies"), 'onSelectFlyType5');
                    this.addActionButton('flyTypeIgnore_button', _("Ignore"), 'onSelectNoFlyType', null, false, 'red');
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
    Mow.prototype.isSimpleVersion = function () {
        return this.gamedatas.simpleVersion;
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
            var ids = rowPick_1 ? [0, 1, 2] : this.gamedatas.playerorder.map(function (id) { return Number(id); });
            var html_1 = '';
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
    };
    Mow.prototype.onPickOpponentCard = function () {
        if (!this.checkAction('exchangeCard'))
            return;
        this.takeAction("exchangeCard", {
            playerId: this.selectedPlayerId
        });
    };
    Mow.prototype.onSelectFlyType1 = function () {
        this.selectFlieType(1);
    };
    Mow.prototype.onSelectFlyType2 = function () {
        this.selectFlieType(2);
    };
    Mow.prototype.onSelectFlyType3 = function () {
        this.selectFlieType(3);
    };
    Mow.prototype.onSelectFlyType5 = function () {
        this.selectFlieType(5);
    };
    Mow.prototype.onSelectNoFlyType = function () {
        this.selectFlieType(null);
    };
    Mow.prototype.selectFlieType = function (type) {
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
        //console.log( 'notifications subscriptions setup' );
        dojo.subscribe('newHand', this, "notif_newHand");
        dojo.subscribe('cardPlayed', this, "notif_cardPlayed");
        dojo.subscribe('farmerCardPlayed', this, "notif_farmerCardPlayed");
        dojo.subscribe('newCard', this, "notif_newCard");
        dojo.subscribe('newFarmerCard', this, "notif_newFarmerCard");
        dojo.subscribe('allowedCards', this, "notif_allowedCards");
        dojo.subscribe('directionChanged', this, "notif_directionChanged");
        dojo.subscribe('herdCollected', this, "notif_herdCollected");
        dojo.subscribe('handCollected', this, "notif_handCollected");
        dojo.subscribe('allTopFlies', this, "notif_allTopFlies");
        dojo.subscribe('replaceCards', this, "notif_replaceCards");
        dojo.subscribe('removedCard', this, "notif_removedCard");
        dojo.subscribe('activeRowChanged', this, "notif_activeRowChanged");
        this.notifqueue.setSynchronous('herdCollected', 2000);
        this.notifqueue.setSynchronous('handCollected', 1500);
    };
    // from this point and below, you can write your game notifications handling methods
    Mow.prototype.notif_newHand = function (notif) {
        //console.log( 'notif_newHand', notif );
        var _this = this;
        // We received a new full hand of 5 cards.
        this.playerHand.removeAll();
        notif.args.cards.forEach(function (card) { return _this.addCardToHand(card); });
        if (notif.args.remainingCards) {
            this.setRemainingCards(notif.args.remainingCards);
        }
    };
    Mow.prototype.notif_cardPlayed = function (notif) {
        console.log('notif_cardPlayed', notif);
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        this.playCardOnTable(notif.args.player_id, notif.args.card, notif.args.row, notif.args.slowpokeNumber);
        this.setRemainingCards(notif.args.remainingCards);
    };
    Mow.prototype.notif_farmerCardPlayed = function (notif) {
        this.playerFarmerHand.removeFromStockById('' + notif.args.card.id);
    };
    Mow.prototype.notif_allowedCards = function (notif) {
        // console.log( 'notif_allowedCards', notif );        
        if (this.gamedatas.herdNumber == 1) {
            this.enableAllowedCards(notif.args.allowedCardsIds);
        }
    };
    Mow.prototype.notif_newCard = function (notif) {
        //console.log( 'notif_newCard', notif );
        var _this = this;
        var card = notif.args.card;
        setTimeout(function () {
            // timeout so new card appear after played card animation
            _this.addCardToHand(card, notif.args.fromPlayerId ? 'playertable-' + notif.args.fromPlayerId : 'remainingCards');
            if (_this.allowedCardsIds && _this.allowedCardsIds.indexOf(card.id) === -1) {
                dojo.query("#myhand_item_" + card.id).addClass("disabled");
            }
        }, 1000);
    };
    Mow.prototype.notif_newFarmerCard = function (notif) {
        //console.log( 'notif_newCard', notif );
        var card = notif.args.card;
        this.addFarmerCardToHand(card);
    };
    Mow.prototype.notif_directionChanged = function (notif) {
        //console.log( 'notif_directionChanged', notif );
        dojo.toggleClass('direction-play-symbol', 'direction-anticlockwise', !notif.args.direction_clockwise);
        dojo.removeClass("direction-animation-symbol");
        dojo.addClass("direction-animation-symbol", notif.args.direction_clockwise ? "anticlockwiseToClockwise" : "clockwiseToAnticlockwise");
        var background = document.getElementById('rowIndicatorBackground');
        if (background) {
            dojo.toggleClass('rowIndicatorBackground', 'inverse', this.gamedatas.direction_clockwise);
        }
    };
    Mow.prototype.notif_herdCollected = function (notif) {
        //console.log( 'notif_herdCollected', notif );
        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        if (notif.args.player_id) {
            this.displayScoring('playertable-' + notif.args.player_id, this.gamedatas.players[notif.args.player_id].color, -notif.args.points, 1000);
            this.scoreCtrl[notif.args.player_id].incValue(-notif.args.points);
            this.theHerds[notif.args.row].removeAllTo('player_board_' + notif.args.player_id);
        }
        else {
            this.theHerds[notif.args.row].removeAllTo('topbar');
        }
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
    Mow.prototype.notif_allTopFlies = function (notif) {
        this.scoreCtrl[notif.args.playerId].toValue(notif.args.points);
    };
    Mow.prototype.notif_replaceCards = function (notif) {
        var _this = this;
        notif.args.oldCards.forEach(function (card) { return _this.playerHand.removeFromStockById('' + card.id); });
        notif.args.newCards.forEach(function (card) { return _this.addCardToHand(card, 'remainingCards'); });
    };
    Mow.prototype.notif_removedCard = function (notif) {
        this.playerHand.removeFromStockById('' + notif.args.card.id, notif.args.fromPlayerId ? 'playertable-' + notif.args.fromPlayerId : undefined);
    };
    Mow.prototype.notif_activeRowChanged = function (notif) {
        this.gamedatas.activeRow = notif.args.activeRow;
        this.slideToObject('rowIndicator', "rowIndicatorWrapper" + notif.args.activeRow);
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
                this.takeAction("playFarmer", {
                    id: id
                });
                this.playerFarmerHand.unselectAll();
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
                if (args.card && typeof args.card_display !== 'string') {
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
                        args.card_display += '<span class="log-arrow rotate180"></span>';
                    }
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
