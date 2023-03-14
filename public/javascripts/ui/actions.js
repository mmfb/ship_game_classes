
async function getGameInfo() {
    let result = await requestPlayerGame();
    if (!result.successful) {
        alert("Something is wrong with the game please login again!");
        window.location.pathname = "index.html";
    } else {
        GameInfo.game = result.game;
        if (GameInfo.scoreBoard) GameInfo.scoreBoard.update(GameInfo.game); 
        else GameInfo.scoreBoard = new ScoreBoard(GameInfo.game);
    }
}


//TODO: T2-4- Create getDecksInfo() function.  See the getGameInfo function

async function getDeckInfo() {
    let result = await requestDecks();
    if (!result.successful) {
        alert("Something is wrong with the game please login again!");
        window.location.pathname = "index.html";
    } else {
        GameInfo.matchDecks = result.decks;
        // Renderers
        if (GameInfo.playerDeck) GameInfo.playerDeck.update(GameInfo.matchDecks.mycards); 
        else GameInfo.playerDeck = new Deck("Your Cards",GameInfo.matchDecks.mycards,30,300,
                                            null,GameInfo.images.card );
        if (GameInfo.oppDeck) GameInfo.oppDeck.update(GameInfo.matchDecks.oppcards); 
        else GameInfo.oppDeck = new Deck("Opponent Cards",GameInfo.matchDecks.oppcards,740,300,
                                            null,GameInfo.images.card );
    }
}



//TODO: T3-4- Create getShipsInfo() function. See the getGameInfo and getDecsInfo() functions
//TODO: T4-2- Change the clickAction parameter used when creating the player deck.
// Instead of null you should now place playCard, the  
//TODO: T5-2- Change the call of the constructor of the Ship class to use the ripples image you loaded on the preload method

//TODO: T4-1- Create the playCard(card) async function 

async function endturnAction() {
    let result = await requestEndTurn();
    if (result.successful) {
        await  getGameInfo();
        GameInfo.prepareUI();
    } else alert("Something went wrong when ending the turn.")
}