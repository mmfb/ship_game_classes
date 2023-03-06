// All the variables for the game UI
// we only have one game info so everything is static
class GameInfo  {
    static width = 1200;
    static height = 600;

    static game;
    static scoreBoard;

    static loading = true;


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