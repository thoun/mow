{OVERALL_GAME_HEADER}

Cards images are not definitive, waiting for official images
<div id="direction-text">
    Direction of play : <span id="direction-play-symbol">↻</span>
</div>
<div id="gamezone">
    <div id="playertables">
        <div id="toprowplayers" class="players-row"></div>

        <div id="theherds"></div>

        <div id="bottomrowplayers" class="players-row"></div>
    </div>

    <div id="direction_popin">
        <div class="popin-content">
            <div class="centered whiteblock">
                <div>
                    <div id="keepDirectionButton" class="direction-button bgabutton bgabutton_blue">
                        {KEEP_DIRECTION}
                        <div id="keepDirectionSymbol" class="direction-symbol">↻</div>
                    </div>
                    {NEXT_PLAYER} : <div id="keepDirectionNextPlayer" class="next-player"></div>
                </div>

                <div>
                    <div id="changeDirectionButton" class="direction-button bgabutton bgabutton_blue">
                        {CHANGE_DIRECTION}
                        <div id="changeDirectionSymbol" class="direction-symbol">↻</div>
                    </div>
                    {NEXT_PLAYER} : <div id="changeDirectionNextPlayer" class="next-player"></div>
                </div>
            </div>
            <div id="pickBlock"></div>
        </div>
    </div>
    <div id="direction_animation">
        <span id="direction-animation-symbol" class="">↻</span>
    </div>
</div>

<script type="text/javascript">
var jstpl_playertable = `<div id="playertable-\${player_id}" class="playertable" data-id="\${player_id}">
  <div class="playertablename" style="color:#\${player_color}" data-id="\${player_id}">
    \${player_name}
  </div>
</div>`;

</script>

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