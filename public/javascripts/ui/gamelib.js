
async function refresh() {
    if (GameInfo.game.player.state == "Waiting") { 
        // Every time we are waiting
        await getGameInfo();   
        //TODO: T2-5- Call the getDecksInfo() function 
        await getDeckInfo();
        //TODO: T3-5- Call the getShipsInfo() function
       
        if (GameInfo.game.player.state != "Waiting") {
            // The moment we pass from waiting to play
            GameInfo.prepareUI();
        }
    } 
    // Nothing to do when we are playing since we control all that happens 
    // so no update is needed from the server
}

function preload() {
    //See how we loaded assets in classes:
    // https://github.com/mmfb/boardgameUI/blob/main/public/javascripts/ui/gamelib.js
    
    //TODO: T2-3: Load the card_template.png file in the assets folder to the GameInfo images object
    GameInfo.images.card = loadImage("/assets/card_template.png"); 
    
    //TODO: T3-3- Load the Ship_big_with_guns.png. 
    // The image should be placed in the GameInfo images object, with property name “ship”.
    
    //TODO: T5-1    - Load the Ship_ripples_big_all.png 
    // The image should be placed in the GameInfo images object, with property name “ripples”.   
}


async function setup() {
    let canvas = createCanvas(GameInfo.width, GameInfo.height);
    canvas.parent('game');
    // preload  images
    
    await  getGameInfo();
    setInterval(refresh,1000);

    //buttons (create a separated function if they are many)
    GameInfo.endturnButton = createButton('End Turn');
    GameInfo.endturnButton.parent('game');
    GameInfo.endturnButton.position(50, GameInfo.height-50);
    GameInfo.endturnButton.mousePressed(endturnAction);
    GameInfo.endturnButton.addClass('game')

    //TODO: T2-5- Call the getDecksInfo() function
    await getDeckInfo();
    //TODO: T3-5- Call the getShipsInfo() function

    GameInfo.prepareUI();
    

    GameInfo.loading = false;
}

function draw() {
    background('darkturquoise');
    if (GameInfo.loading) {
        textAlign(CENTER, CENTER);
        textSize(40);
        fill('black');
        text('Loading...', GameInfo.width/2, GameInfo.height/2);
    } else {
        GameInfo.scoreBoard.draw();
        //TODO: T2-6 Call the deck rendeder draw method for the player and opponent
        // Remember you placed the renderer objects in the  playerDeck and oppDeck properties of the GameInfo
        // See how the draw method is called for the ScoreBoard renderer
        GameInfo.playerDeck.draw();
        GameInfo.oppDeck.draw();

        //TODO: T3-6- Call the draw method of the ship redererer objects 
        // Remember you placed the renderer objects in the  playerShip and oppShip properties of the GameInfo

    }
    
}

async function mouseClicked() {
    // TODO: T4-3- Call the player deck click method
}

