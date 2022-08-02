{OVERALL_GAME_HEADER}

<div id="direction-text">
    {DIRECTION} <span id="direction-play-symbol" class="direction-arrow-icon"></span>
</div>
<div id="direction_popin">
    <div class="popin-content">
        <div class="centered whiteblock">
            <div>
                <div id="keepDirectionButton" class="direction-button bgabutton bgabutton_blue">
                    {KEEP_DIRECTION}
                    <div id="keepDirectionSymbol" class="direction-symbol direction-arrow-icon white"></div>
                </div>
                <span class="label-next-player">{NEXT_PLAYER}</span> : <div id="keepDirectionNextPlayer" class="next-player"></div>
            </div>

            <div>
                <div id="changeDirectionButton" class="direction-button bgabutton bgabutton_blue">
                    {CHANGE_DIRECTION}
                    <div id="changeDirectionSymbol" class="direction-symbol direction-arrow-icon white"></div>
                </div>
                <span class="label-next-player">{NEXT_PLAYER}</span> : <div id="changeDirectionNextPlayer" class="next-player"></div>
            </div>
        </div>
        <div id="pickBlock"></div>
    </div>
</div>
<div id="gamezone">
    <div id="playertables">
        <div class="illustration left"></div>
        <div class="illustration right"></div>

        <div id="toprowplayers" class="players-row"></div>

        <div id="theherds"></div>

        <div id="bottomrowplayers" class="players-row"></div>
    </div>
    <div id="direction_animation">
        <span id="direction-animation-symbol"></span>
    </div>
</div>

<div id="opponent-hand-wrap" class="whiteblock hand-wrap hidden">
    <div class="hand-label"><h3 id="opponent-hand-label"></h3></div>
    <div id="opponent-animals" class="animals"></div>
</div>

<div id="handdeck">
    <div id="myhand_wrap" class="whiteblock">
        <h3>{MY_HAND}</h3>
        <div id="cows-and-farmers">
            <div id="myhand"></div>
            <div id="myfarmers"></div>
        </div>
    </div>
    
    <div id="deck_wrap" class="whiteblock">
        <h3>{DECK_REMAINING_CARDS}</h3>
        <div id="deck" class="card-back">
            <div id="remainingCards">{REMAINING_CARDS}</div>
        </div>
    </div>
</div>

{OVERALL_GAME_FOOTER}