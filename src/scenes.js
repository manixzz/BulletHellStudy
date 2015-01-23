//This file contains all the Crafty Scenes that would be displayed.

//Global variables used for logging purposes
var startTime, endTime = 0;
var scaleRatio = 0;
var currentBlock = 0;
var maxBlock = 5; // represents 6 blocks, since we start at block 0. Block 0 will be the trial run block.

var Metrics = Parse.Object.extend("Metrics"); 
var metrics = new Metrics(); // Create the Parse object that will hold all the logging data.

//These three functions are used for data logging. 
function setMetricsTime(key) { //appending the value to a record
    var d = new Date();
    metrics.set(key, d.getTime() - startTime);
}

function addMetricsTime(key) { //adding the value to the record
    var d = new Date();
    metrics.add(key, d.getTime() - startTime);
}

function incrementMetricsCounter(key) { // All numeric values use this to increment their respective counters
    metrics.increment(key);
}

initializeDefaultMetrics(); // done to ensure that we don't have any null records in our final Parse object


// Reset the non player related metrics whenever a block is over.
function resetMetrics() {
    metrics = new Metrics();
    initializeDefaultMetrics();

    metrics.set("typeOfScalingUsed", window.typeOfScaling);
    metrics.add("scaleRatioUsed", Screen.ratio());
    metrics.set("tester", document.getElementById("fullName").value);
    metrics.set("screenSize", document.getElementById("screenSize").value);
    metrics.set("screenX", Crafty.viewport.width);
    metrics.set("screenY", Crafty.viewport.height); //these assume the player doesn't change the screen res
}

// Initialize certains records to ensure we don't have any null records in our final Parse object. 
function initializeDefaultMetrics() {
    var val = 0;
    metrics.set("bonusCollected", val);
    metrics.set("bonusCreated", val);
    metrics.set("playerProjectiles", val);
    metrics.set("playerHit", val);
    metrics.set("enemyProjectiles", val);
    metrics.set("enemiesKilled", val);
    metrics.set("enemiesCreated", val);
}

// Calculates the length of time the entire block took.
function calculateGameTime() {
    var d = new Date();
    endTime = d.getTime();

    var elapsedTime = endTime - startTime;

    metrics.set("elapsedTime", elapsedTime);
}

// Sets the final score record after the block is over. 
function calculateFinalScore() {
    finalScore = Crafty("Score")._score; // Accesses the Score entity. This requires there to be only one score entity at a time. 
    metrics.set("finalScore", finalScore);
}

// Calculates the longest length of time the player is alive in a block. 
function calculateLongestPlayerAliveTime() {
    var playerAliveTimeArray = metrics.get("PlayerCreated");
    var playerDeadTimeArray = metrics.get("PlayerDestroyed");
    var timeAlive = 0;
    var maxTimeAlive = 0;

    for (i = 0; i < playerAliveTimeArray.length; i++) {
        timeAlive = playerDeadTimeArray[i] - playerAliveTimeArray[i];
        if (timeAlive > maxTimeAlive) {
            maxTimeAlive = timeAlive;
        }
    }

    metrics.set("maxTimeAlive", maxTimeAlive);
    return maxTimeAlive/1000; //return answer whilst converting ms to s. This is done because the statistics presented at the the end of the block, are reported in seconds. 
}

// A helper function to print statistics at the end of a block. Created to prevent some code duplication.
function printText(xOffset, yOffset, widthOffset, text, textSizePercent, textAlign) {
    Crafty.e("2D, DOM, Text")
    .attr({x: xOffset*xviewport, y: yOffset*yviewport, w: widthOffset*xviewport})
    .text(text)
    .textFont({size: textSizePercent*xviewport + "px"})
    .textColor("#FFFFFF")
    .css({
        "text-align" : textAlign
    })
}

// Prints the statistics at the end of the block.
function printStatistics() {
    var textP;
    var defxo = 0.1, //default x offset
    defwo = 1,  //default width offset
    wo = 0.8 //another width offset
    deftp = 0.05; // default text percentage
    textP = "Statistics";
    printText(0, 0.25, defwo, textP, deftp, "center");

    //Longest Time Alive Statistic
    textP = "Longest time alive:";
    printText(defxo, 0.35, defwo, textP, deftp, "left");
    textP =  calculateLongestPlayerAliveTime() + "s";
    printText(defxo, 0.35, wo, textP, deftp, "right");

    //Number of Deaths Statistic
    textP = "Number of deaths:";
    printText(defxo, 0.45, defwo, textP, deftp, "left");
    textP = metrics.get("playerHit");
    printText(defxo, 0.45, wo, textP, deftp, "right");

    //Enemies Destroyed Statistic
    textP = "Enemies Destroyed:";
    printText(defxo, 0.55, defwo, textP, deftp, "left");
    textP = metrics.get("enemiesKilled");
    printText(defxo, 0.55, wo, textP, deftp, "right");

    //Bonuses Collected Statistic
    textP = "Bonuses collected:";
    printText(defxo, 0.65, defwo, textP, deftp, "left");
    textP = metrics.get("bonusCollected");
    printText(defxo, 0.65, wo, textP, deftp, "right");

    //Final Score Statistic
    textP = "Final Score:";
    printText(defxo, 0.75, defwo, textP, deftp, "left");
    textP = Crafty("Score")._score;
    printText(defxo, 0.75, wo, textP, deftp, "right");
}


//Loads the initial start screen, which allows the player to get ready for the game. 
Crafty.scene("startScreen", function() {
    scaleRatio = Screen.ratio();
    metrics.set("typeOfScalingUsed", window.typeOfScaling);
    metrics.add("scaleRatioUsed", scaleRatio);

    var textPercent = 0.1,
    xviewport = Crafty.viewport.width,
    yviewport = Crafty.viewport.height;
    var text = "Press the Start button to start.";

    //logging metrics from the html page
    metrics.set("tester", document.getElementById("fullName").value);
    metrics.set("screenSize", document.getElementById("screenSize").value);
    metrics.set("screenX", xviewport);
    metrics.set("screenY", yviewport); //these assume the player doesn't change the screen res

    Crafty.background("url(img/StarBackground.png) no-repeat center center");

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: yviewport/8, w: xviewport})
        .text("Bullet Hell")
        .textFont({size: textPercent*xviewport + 'px'})
        .textColor("#FFFFFF")
        .css({
            "text-align": "center",
        })

    Crafty.e("2D, Color, DOM, Text, Keyboard, Mouse")        
        .text(text)
        .attr({w: xviewport, x: 0, y: yviewport/2})
        .textColor("#FFFFFF")
        .textFont({size: (textPercent*xviewport)/2 + 'px'})
        .css({
            "text-align": "center",
        })
        .bind('KeyDown', function(e) {
            if(e.key == Crafty.keys['ENTER']) {
                Crafty.scene("main");
            }
        })
});

/*
This scene loads the required entities. It also creates the gamelogic
entity which handles the progress of the game. 
*/
Crafty.scene("main", function() {
    metrics.set("currentBlock", currentBlock);
    var d = new Date();
    startTime = d.getTime();

    var finalScore = 0;

    Crafty.sprite("img/PlayerSprite.png", {
        playerShip: [0, 0, 99, 75]
    });

    Crafty.sprite("img/EnemySpriteTypeOne.png", {
        enemySpriteTypeOne: [0,0, 104, 84]
    });

    Crafty.sprite("img/EnemySpriteTypeTwo.png", {
        enemySpriteTypeTwo: [0,0, 103, 84]
    });

    Crafty.sprite("img/BonusSprite.png", {
        bonusSprite: [0,0, 31, 30]
    });

    Crafty.sprite("img/PlayerProjectileSprite.png", {
        ppSprite: [0,0, 13, 37]
    });

    Crafty.sprite("img/EnemyProjectileSprite.png", {
        epSprite: [0,0, 13, 37]
    });

    Crafty.audio.add("laser", "audio/laser.wav");
    Crafty.audio.add("explosion", "audio/boom.wav");

    var player = Crafty.e("Player");
    addMetricsTime("PlayerCreated");
        
    Crafty.e("Score");   

    var gamelogic = Crafty.e("GameLogic");

    Crafty.e("Time");

    var secondInterval = setInterval(function () {
        Crafty("Time").updateTime();
    }, 1000); // decrement the time on the HUD. 1000ms = 1 second

    // Bind the event which triggers when the Player is destroyed.
    // After which the 'GameOver' scene is loaded
    this.bind("PlayerDestroyed", function() {
        addMetricsTime("PlayerDestroyed");
        clearInterval(secondInterval); // necessary to stop the secondInterval counter
        calculateFinalScore();
        gamelogic.destroy();        
        Crafty.scene("GameOver");
    });

    this.bind("RespawnPlayer", function () {
        player.destroy();
        addMetricsTime("PlayerDestroyed");
        player = Crafty.e("Player");
        addMetricsTime("PlayerCreated");
    });

    this.bind("BlockOver", function() {
        addMetricsTime("PlayerDestroyed");
        calculateGameTime();
        clearInterval(secondInterval); // necessary to stop the second counter
        calculateFinalScore();        
        gamelogic.destroy();
        
        this.unbind("RespawnPlayer");
        this.unbind("PlayerDestroyed");
        this.unbind("BlockOver");

        Crafty.scene("NextBlock");
    });
});

Crafty.scene("NextBlock", function() {
    var text = "Press the Start Button to begin the next block.";
    var blocktext = "";
    if(currentBlock == 0) {
        blocktext = "Trial Block Over"
    } else {
        blocktext = "Block " + (currentBlock) + " Over";
    }

    Crafty.e("2D, DOM, Text")
    .attr({x: 0, y: 0.05*yviewport, w:xviewport})
    .text(blocktext)
    .textFont({size: .1*xviewport + "px"})
    .textColor("#FFFFFF")
    .css({
        "text-align" : "center"
    })

    printStatistics();

    Crafty("Score").destroy();

    metrics.save(null, {
        success: function(metrics) {
            console.log("Successfully saved data.");
        },

        error: function(metrics, error) {
            console.log("Error: " + error.description);
        }
    });

    Crafty.e("2D, DOM, Text, Keyboard, Mouse")
        .attr({x: 0, y: 0.85*yviewport, w: xviewport})
        .text(text)
        .textFont({size: .05*xviewport +"px"})
        .textColor("#FFFFFF")
        .css({
            "text-align" : "center"
        })        
        .bind('KeyDown', function(e) {
            if(e.key == Crafty.keys['ENTER']) {
                resetMetrics();
                Crafty.scene("main"); //begin another block
            }
        })

    currentBlock+=1;
});

// Could have been abstracted and combined with the nextblock scene to prevent code duplication. However, it was left seperate.
Crafty.scene("GameOver", function() {
    calculateGameTime();

    var text = "Press the Start button to restart the game."

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: 0.05*yviewport, w:xviewport})
        .text("Game Over")
        .textFont({size: 0.1*xviewport + "px"})
        .textColor("#FFFFFF")
        .css({
            "text-align" : "center"
        })

    printStatistics();

    Crafty("Score").destroy();

    metrics.save(null, {
        success: function(metrics) {
            console.log("Successfully saved data.");
        },

        error: function(metrics, error) {
            console.log("Error: " + error.description);
        }
    });

    Crafty.e("2D, DOM, Text, Keyboard, Mouse")
        .attr({x: 0, y:0.85*yviewport, w: xviewport})
        .text(text)
        .textFont({size: 0.05*xviewport + "px"})
        .textColor("#FFFFFF")
        .css({
            "text-align" : "center"
        })        
        .bind('KeyDown', function(e) {
            if(e.key == Crafty.keys['ENTER']) {
                location.reload(); //reload the website
            }
        })
});

