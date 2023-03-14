const pool = require("../config/database");
const Settings = require("./gameSettings");

function fromDBCardToCard(dbCard) {
    return new Card(dbCard.crd_id,dbCard.ugc_id,dbCard.crd_cost,
        dbCard.crd_name, dbCard.crd_effect, dbCard.crd_note,
        new CardType(dbCard.ct_id,dbCard.ct_name),
        dbCard.ugc_active);
}

class CardType {
    constructor (id,name) {
        this.id = id;
        this.name = name;
    }
}

class Card {
    constructor(cardId,deckId,cost,name,effect,note,type, active) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.cost = cost;
        this.name = name;
        this.effect = effect;
        this.note = note;
        this.type = type;
        this.active = active;
    }

    static async genCard(playerId) {
        try {
            let [cards] = await pool.query(`select * from card inner join card_type on crd_type_id = ct_id`);
            let rndCard = fromDBCardToCard(cards[Math.floor(Math.random()*cards.length)]);
            // insert the card
            let [result] = await pool.query(`Insert into user_game_card (ugc_user_game_id,ugc_crd_id,ugc_active)
                  values (?,?,?)`, [playerId,rndCard.cardId,true]);
            return {status:200, result: rndCard};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}


class MatchDecks {
    constructor(mycards,oppcards) {
        this.mycards = mycards;
        this.oppcards = oppcards;
    }

    // No verifications are made since this is consider to be an auxiliary method
    // We consider it will only be called at the right time
    static async genPlayerDeck(playerId) {
        try {
            let cards =[];
            for (let i=0; i < Settings.nCards; i++) {
                let result = await Card.genCard(playerId);
                cards.push(result.result);
            }
            return {status:200, result: cards};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // No verifications are made since this is consider to be an auxiliary method
    // We consider it will only be called at the right time
    static async resetPlayerDeck(playerId) {
        try {
            let [result] = await pool.query(`delete from user_game_card where ugc_user_game_id = ?`, [playerId]);
            return {status:200, result: {msg:"All cards removed"}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getMatchDeck(game) {
        try {
            let [dbcards] = await pool.query(`Select * from card
            inner join card_type on crd_type_id = ct_id 
            inner join user_game_card on ugc_crd_id = crd_id
            where ugc_user_game_id = ? or ugc_user_game_id = ?`, 
                [game.player.id, game.opponents[0].id]);
            let playerCards = [];
            let oppCards = [];
            for(let dbcard of dbcards) {
                let card = fromDBCardToCard(dbcard);
                if (dbcard.ugc_user_game_id == game.player.id) {
                    playerCards.push(card);
                } else {
                    oppCards.push(card);
                }
            }
            return {status:200, result: new MatchDecks(playerCards,oppCards)};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
    
    static async playDeckCard(game,deckId) {
        try {
            // get the card and check if the card is from the player and it is active
            let [dbDeckCards] = await pool.query(`Select * from card 
            inner join card_type on crd_type_id = ct_id
            inner join user_game_card on ugc_crd_id = crd_id
            where ugc_user_game_id = ? and ugc_id = ? and ugc_active=1`, 
                [game.player.id, deckId]);
            if (dbDeckCards.length == 0) {
                return {status:404, result:{msg:"Card not found for this player or not active"}};
            }   
            let card =  fromDBCardToCard(dbDeckCards[0]);
            let playerShip = game.player.ship;
            let oppShip = game.opponents[0].ship; 
            
            // verifications
            // Check if we have enough action points
            if (playerShip.ap < card.cost) {
                return {status:400, result:{msg:"Not enough action points"}};
            }

            //specific rule verification
            // No actions when ship is on defensive maneuvers
            if (playerShip.state.name == "Defensive") {
                return {status:400, result:{msg:"Ship cannot do any other actions while on defensive maneuvers"}};
            }
            // Last Hope and Defensive Maneuvers can only be played if no other card was played
            if ((card.cardId == 6 || card.cardId == 7) && playerShip.state.name != "Ready") {
                return {status:400, result:{msg:"That card cannot be played when another card was already played"}};    
            }
            // verifications done, set card to inactive
            await pool.query("update user_game_card set ugc_active=0 where ugc_id = ?",[deckId]);

            // Change the ships and then update the database with the resulting ships
            // Remove the base action points
            playerShip.ap -= card.cost;
            // Set player state to Acted (since we already made all the state checks)
            playerShip.state.id = 2;
            // This line should not be necessary since we only use the id to update the DB
            playerShip.state.name = "Acted";

            switch (card.cardId) {
                case 1: attackFullSalvo(oppShip); break;
                case 2: attackAimedShot(oppShip); break;
                case 3: attackBarrage(oppShip); break;
                case 4: await attackWeakSpot(game.player.id,oppShip); break;
                case 5: healRepair(playerShip); break;
                case 6: healLastHope(playerShip); break;
                case 7: defenseManeuvers(playerShip); break;
            }
            let shipSql = `update ship set sh_state_id = ?, sh_hp = ?, sh_ap = ?
                           where sh_id = ?`;
            // Updating player ship and opponent ship (same query, different values)
            await pool.query(shipSql,[playerShip.state.id, playerShip.hp,
                                        playerShip.ap, playerShip.id]);
            await pool.query(shipSql,[oppShip.state.id, oppShip.hp,
                                            oppShip.ap, oppShip.id]);

            return {status:200, result: {msg: "Card played!"}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
    
}

// Auxiliary functions to calculate card actions

function attackFullSalvo(oppShip) {
    if (oppShip.state.name!="Defensive") {
        oppShip.hp -= 3;
    }
}
function attackAimedShot(oppShip) {
    if (oppShip.state.name!="Defensive") {
        oppShip.hp -= (oppShip.hp < Settings.halfHP)?2:1;
    }
}
function attackBarrage(oppShip) {
    oppShip.hp -= 2;
}
async function attackWeakSpot(playerId,oppShip) {
    if (oppShip.state.name!="Defensive") {
        // we count all attack cards played (even this card, since the card does at least 1 damage)
        let [result] = await pool.query(
            `Select count(*) as count from user_game_card 
            inner join card on ugc_crd_id = crd_id
            where ugc_user_game_id = ? and ugc_active=0 and crd_type_id = 1`, 
            [playerId]);
        let count = result[0].count;
        oppShip.hp-=count;
    }
}

function healRepair(playerShip) {
    playerShip.hp += 2;
    if (playerShip.hp > Settings.maxShipHP) playerShip.hp = Settings.maxShipHP;
}

function healLastHope(playerShip) {
    playerShip.hp += 4;
    if (playerShip.hp > Settings.maxShipHP) playerShip.hp = Settings.maxShipHP;
    else if (playerShip.hp < Settings.halfHP) playerShip.hp = Settings.halfHP;
    // Action points go to zero
    playerShip.ap = 0;
}

function defenseManeuvers(playerShip) {
    playerShip.state.id = 3;
    // we will only use the id to update the DB, so this line shouldn't be needed 
    playerShip.state.name = "Defensive";
}







module.exports = MatchDecks;