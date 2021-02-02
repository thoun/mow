{OVERALL_GAME_HEADER}

Cards images are not definitive, waiting for official images
<div id="direction-text">
    Direction of play : <span id="direction-play-symbol">↻</span>
</div>
<div id="gamezone">
    <div id="playertables">
        <div id="toprowplayers" class="players-row"></div>

        <div id="theherd"></div>

        <div id="bottomrowplayers" class="players-row"></div>
    </div>

    <div id="direction_popin">
        <div class="centered whiteblock">
            <div id="keepDirectionButton" class="direction-button bgabutton bgabutton_blue">
                {KEEP_DIRECTION}
                <div id="keepDirectionCard" class="direction-card"></div>
            </div>

            <div id="changeDirectionButton" class="direction-button bgabutton bgabutton_blue">
                {CHANGE_DIRECTION}
                <div id="changeDirectionCard" class="direction-card"></div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
var jstpl_playertable = `<div id="playertable-\${player_id}" class="playertable">
  <div class="playertablename" style="color:#\${player_color}">
    \${player_name}
  </div>
</div>`;

</script>

<div id="handdeck">
    <div id="myhand_wrap" class="whiteblock">
        <h3>{MY_HAND}</h3>
        <div id="myhand">
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