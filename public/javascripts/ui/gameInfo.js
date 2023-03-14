// All the variables for the game UI
// we only have one game info so everything is static
class GameInfo  {
    // settings variables
    static width = 1400;
    static height = 750;

    static loading = true;

    // data
    static game;
    static images = {};
    static sounds = {};
    //TODO: T2-2: Create matchDecks variable
    static matchDecks;

    // renderers
    static scoreBoard;
    //TODO: T2-2: Create playerDeck and oppDeck variables 
    static playerDeck;
    static oppDeck;
    
    //TODO: T3-2- Create the playerShip and oppShip variables

    // buttons
    static endturnButton;

    // Write your UI settings for each game state here
    // Call the method every time there is a game state change
    static prepareUI() {
        if (GameInfo.game.player.state == "Playing") { 
            GameInfo.endturnButton.show();
        } else if (GameInfo.game.player.state == "Waiting") {
            GameInfo.endturnButton.hide();
        } 
    }
}