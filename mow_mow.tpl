{OVERALL_GAME_HEADER}

<div id="mainTable" class="whiteblock">   
	<h3>{THE_HERD}</h3>	
    <div id="theherd">
    </div>	
</div>

<div id="handdeck">
    <div id="myhand_wrap" class="whiteblock">
        <h3>{MY_HAND}</h3>
        <div id="myhand">
        </div>
    </div>
    <div id="direction_wrap" class="whiteblock">
        <h3>{DIRECTION}</h3>
        <div id="direction" class="direction-card"></div>
        <div id="surrounding_players">
            <div class="player_before" style="color: #{player_before_color}">{player_before_name}</div>
            <div class="player_after" style="color: #{player_after_color}">{player_after_name}</div>
        </div>
    </div>
    <div id="deck_wrap" class="whiteblock">
        <h3>{DECK_REMAINING_CARDS}</h3>
        <div id="deck" class="card-back">
            <div id="remainingCards">{REMAINING_CARDS}</div>
        </div>
    </div>
</div>

<div id="direction_popin">
    <div class="centered whiteblock">
        <div id="keepDirectionButton" class="direction-button">
            {CHANGE_DIRECTION}
            <div class="direction-card reverseDirection"></div>
        </div>

        <div id="changeDirectionButton" class="direction-button">
            {KEEP_DIRECTION}
            <div class="direction-card"></div>
        </div>
    </div>
</div>

{OVERALL_GAME_FOOTER}