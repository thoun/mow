<?php

$gameinfos = [

// Game designer (or game designers, separated by commas)
'designer' => 'Bruno Cathala',       

// Game artist (or game artists, separated by commas)
'artist' => 'Cyril Bouquet',         

// Year of FIRST publication of this game. Can be negative.
'year' => 2022,                 

// Game publisher
'publisher' => 'Hurrican',                     

// Url of game publisher website
'publisher_website' => 'http://www.hurricangames.com/',   

// Board Game Geek ID of the publisher
'publisher_bgg_id' => 6015,

// Board game geek if of the game
'bgg_id' => 38984,


// Players configuration that can be played (ex: 2 to 4 players)
'players' => [2,3,4,5],    

// Suggest players to play with this number of players. Must be null if there is no such advice, or if there is only one possible player configuration.
'suggest_player_number' => null,

// Discourage players to play with these numbers of players. Must be null if there is no such advice.
'not_recommend_player_number' => [2],

// Estimated game duration, in minutes (used only for the launch, afterward the real duration is computed)
'estimated_duration' => 30,           

// Time in second add to a player when "giveExtraTime" is called (speed profile = fast)
'fast_additional_time' => 30,           

// Time in second add to a player when "giveExtraTime" is called (speed profile = medium)
'medium_additional_time' => 40,           

// Time in second add to a player when "giveExtraTime" is called (speed profile = slow)
'slow_additional_time' => 50,           

// If you are using a tie breaker in your game (using "player_score_aux"), you must describe here
// the formula used to compute "player_score_aux". This description will be used as a tooltip to explain
// the tie breaker to the players.
// Note: if you are NOT using any tie breaker, leave the empty string.
//
// Example: 'tie_breaker_description' => totranslate( "Number of remaining cards in hand" ),
'tie_breaker_description' => "",

// Game is "beta". A game MUST set is_beta=1 when published on BGA for the first time, and must remains like this until all bugs are fixed.
'is_beta' => 1,                     

// Is this game cooperative (all players wins together or loose together)
'is_coop' => 0, 


// Complexity of the game, from 0 (extremely simple) to 5 (extremely complex)
'complexity' => 1,    

// Luck of the game, from 0 (absolutely no luck in this game) to 5 (totally luck driven)
'luck' => 3,    

// Strategy of the game, from 0 (no strategy can be setup) to 5 (totally based on strategy)
'strategy' => 1,    

// Diplomacy of the game, from 0 (no interaction in this game) to 5 (totally based on interaction and discussion between players)
'diplomacy' => 0,  

// Colors attributed to players
'player_colors' => ['ff0000', '008000', '0000ff', 'ffa500', '000000', 'e94190', '982fff', '72c3b1', 'f07f16', 'bdd002', '7b7b7b'],

// Favorite colors support : if set to "true", support attribution of favorite colors based on player's preferences (see reattributeColorsBasedOnPreferences PHP method)
// NB: this parameter is used only to flag games supporting this feature; you must use (or not use) reattributeColorsBasedOnPreferences PHP method to actually enable or disable the feature.
'favorite_colors_support' => true,

// When doing a rematch, the player order is swapped using a "rotation" so the starting player is not the same
// If you want to disable this, set this to true
'disable_player_order_swap_on_rematch' => false, 

// Game presentation
// Short game presentation text that will appear on the game description page, structured as an array of paragraphs.
// Each paragraph must be wrapped with totranslate() for translation and should not contain html (plain text without formatting).
// A good length for this text is between 100 and 150 words (about 6 to 9 lines on a standard display)
'presentation' => [
    totranslate("A gentle breeze has set the green grass swaying, and the sun will soon be setting. Time to round up the cows and lead them back to the stable. But steer clear of the ones covered in flies... Nobody like flies! Avoid the most flies to become these majestic creatures’ favorite farmer!"),
],

// Games categories
//  You can attribute any number of "tags" to your game.
//  Each tag has a specific ID (ex: 22 for the category "Prototype", 101 for the tag "Science-fiction theme game")
'tags' => [2, 200]
];
