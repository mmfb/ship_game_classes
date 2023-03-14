const pool = require("../config/database");
const MatchDecks = require("./decksModel");
const Settings = require("./gameSettings");


class Play {

    // At this moment I do not need to store information so we have no constructor
    
    // we consider all verifications were made
    static async startGame(game) {
        try {
            // Randomly determines who starts    
            let myTurn = (Math.random() < 0.5);
            let p1Id = myTurn ? game.player.id : game.opponents[0].id;
            let p2Id = myTurn ? game.opponents[0].id : game.player.id;
            // Player that start changes to the state Playing 
            await pool.query(`Update user_game set ug_state_id=? where ug_id = ?`, [2, p1Id]);
            // Changing the game state to start
            await pool.query(`Update game set gm_state_id=? where gm_id = ?`, [2, game.id]);

            // ---- Specific to this game
            // Player that starts gets new cards
            await MatchDecks.genPlayerDeck(p1Id);

            // generating ships for both players first player gets 3 action points
            let shipSql = `Insert into ship (sh_user_game_id,sh_state_id,sh_hp,sh_ap) 
                    values (?,?,?,?)`
            await pool.query(shipSql, [p1Id, 1, Settings.maxShipHP, Settings.apPerTurn]);
            await pool.query(shipSql, [p2Id, 1, Settings.maxShipHP, 0]);

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // This considers that only one player plays at each moment, 
    // so ending my turn starts the other players turn
    // We consider the following verifications were already made:
    // - The user is authenticated
    // - The user has a game running
    // NOTE: This might be the place to check for victory, but it depends on the game
    static async endTurn(game) {
        try {
            // Change player state to waiting (1)
            await pool.query(`Update user_game set ug_state_id=? where ug_id = ?`,
                [1, game.player.id]);
            // Change opponent state to playing (2)
            await pool.query(`Update user_game set ug_state_id=? where ug_id = ?`,
                [2, game.opponents[0].id]);
            // Increase the number of turns.
            await pool.query(`Update game set gm_turn=gm_turn+1 where gm_id = ?`,
                [game.id]);
            // removes the cards of the player that ended and get new cards to the one that will start
            await MatchDecks.resetPlayerDeck(game.player.id);
            await MatchDecks.genPlayerDeck(game.opponents[0].id);
            // Give actions points to the player that started and reset the ship state to Ready
            await pool.query(`Update ship set sh_ap=sh_ap+?, sh_state_id=1 where sh_user_game_id = ?`,
                [Settings.apPerTurn, game.opponents[0].id]);

            return { status: 200, result: { msg: "Your turn ended." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }



}

module.exports = Play;