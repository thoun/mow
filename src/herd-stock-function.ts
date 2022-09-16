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
declare const dojo: Dojo;

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
    const rows: number[][] = [];
    const acrobaticRowsIndexes = [];
    (this as Stock).items.forEach((item, i: number) => {
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
                const matchingItemIndex = (this as Stock).items.findIndex(item => item.type % 10 === acrobaticDisplayedNumber);
                //console.log('iAcrobatic: ',iAcrobatic, 'acrobaticDisplayedNumber', acrobaticDisplayedNumber, 'matchingItemIndex', matchingItemIndex);
                const item = this.items[acrobaticNumber];
                if (typeof item.loc == "undefined") {
                    topDestination = iRow * (itemHeight + itemMargin);

                    topDestinations[acrobaticNumber] = topDestination;
                    leftDestinations[acrobaticNumber] = (matchingItemIndex === -1 ? 0 : leftDestinations[matchingItemIndex]) ?? 0;
                    zIndexes[acrobaticNumber] = 0;
                }
            });
        }
    });

    for (let i in this.items) {
        topDestination = topDestinations[i];
        leftDestination = leftDestinations[i];
        //console.log(i, leftDestinations, leftDestination);

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
