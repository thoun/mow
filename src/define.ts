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
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
	"ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.mow", ebg.core.gamegui, new Mow());             
});