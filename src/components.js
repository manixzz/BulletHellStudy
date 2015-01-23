//This file contains all the individual components required for the game.

//This function is called once at the beginning to ensure pseudo-random numbers
//are always generated. After this line of code, anytime Crafty.math.randomInt is called, it will be pseudo random.
Math.seedrandom(5);

//One global object to hold the screen related variables.
 var Screen = {
    xviewport: window.innerWidth,
    yviewport: window.innerHeight,
    //Currently screen ratio is a variable that is manipulated when it significantly differs
    //from what we need. 
    ratio: function() {
        var r = [1,1];
        if(window.typeOfScaling == "Naive") {
            r[0] = (windowResX/defaultResX)*defaultScreenRatio;
            r[1] = (windowResY/defaultResY)*defaultScreenRatio;
        } else if (window.typeOfScaling == "Aspect") {
            var res = windowResX/windowResY;
            r = [res,res];
        }
        return r;
    }
}

/* 
One global object to hold all the remaining variables. This is to make it easier to quickly 
change values.
*/ 
var Variables =  {

    GameLogic: {
        spawnEnemyTimeout: false, // when set to false, will prevent enemies from spawning in the game infinitely. Should be set to false.
        spawnBonusTimeout: false, // when set to false, will prevent bonuses from spawning in the game infinitely. Should be set to false.
        bonusTimeout: 10000, 
        enemyTimeout: 300,
        minEnemiesOnScreen: 5,  
        minBonusOnScreen: 1
    },

    Player: {
        playerSize: 18, // calculating the player's ship size based on a constant value and the screen ratio
        shoot: false, // When set to false, this flag ensures that the player cannot shoot infinitely
        moveSpeed: 5,
        shootDelay: 300,
    },

    Enemy: {
        shoot: false, // When set to false, this flag ensures that the enemy cannot shoot infinitely
        shootDelay: [800, 1000], //since enemy type is a int value, currently either 0 or 1, I use an array to store the respective enemy's shoot delay
        maxCircProjectile: 4,
        size: 22.5,
        ypos: 0,
        minXSpeed: -3,
        maxXSpeed: 3,
        minYSpeed: 1, 
        maxYSpeed: 3,
        minType: 0,
        maxType: 1,
        angle: Math.PI/4 //angle between projectiles in the circle pattern
    },

    Bonus: {
        yspeed: 2,
        unitSize: 22.5
    },

    PlayerProjectile: {
        size: 3.375,
        speed: 10,
        theta: -Math.PI/2 // default, projectiles go straight up.
    },

    EnemyProjectiles: {
        size: 4.5,
        speed: 4,
        theta: Math.PI/2 // default projectiles go down.
    },

    Time: {
        maxBlockTime: 60, //5 minutes aka 300 seconds 
    }

}
//Contains the definition of the game's logic
Crafty.c("GameLogic", {
    init: function() {

        this.spawnEnemyTimeout = Variables.GameLogic.spawnEnemyTimeout,
        this.spawnBonusTimeout = Variables.GameLogic.spawnBonusTimeout,
        this.bonusTimeout = Variables.GameLogic.bonusTimeout,
        this.enemyTimeout = Variables.GameLogic.enemyTimeout,
        this.minEnemiesOnScreen = Variables.GameLogic.minEnemiesOnScreen,
        this.minBonusOnScreen = Variables.GameLogic.minBonusOnScreen;

        //Denotes the game's behaviour for each iteration of the game loop
        this.bind("EnterFrame", function(e) {

            var currentScore = Crafty("Score")._score;

            //Only one Bonus exists on the screen at a given time.
            //Bonus boxes are spawned periodically with a fixed time delay inbetween each one spawning.
            if(Crafty("Bonus").length < this.minBonusOnScreen && !this.spawnBonusTimeout) {
                this.spawnBonusTimeout = true;
                Crafty.e("Bonus");

                this.timeout(function() {
                    this.spawnBonusTimeout = false;
                }, this.bonusTimeout)
            }

            //Spawns enemies until the minimum number on screen is reached. 
            if(Crafty("Enemy").length < this.minEnemiesOnScreen && !this.spawnEnemyTimeout) {
                this.spawnEnemyTimeout = true;

                Crafty.e("Enemy");

                this.timeout(function() {
                    this.spawnEnemyTimeout = false;
                }, this.enemyTimeout);
            }   
        });
    }
});

//Text component for Score, displays the current score on the screen.
Crafty.c("Score", {
    _score: 0,
    init: function() {
        this.addComponent("2D, DOM, Text, Persist");
        this.attr({x: 5, y: 5, w: Crafty.viewport.width, h: 50});
        this.textFont({size: "30px"});
        this.textColor("#FFFFFF");
        this.text("Score: " + this._score);
    },

    updateScore: function(newScore) {
        this._score += newScore;
        this.text("Score: " + this._score);
    }
});

//Text component for Time, displays the game's remaining time in seconds on screen.
Crafty.c("Time", {
    init: function() {
        this.currentTime = Variables.Time.maxBlockTime;
        this.addComponent("2D, DOM, Text");
        this.attr({x: Crafty.viewport.width - 150, y: 5, w: Crafty.viewport.width, h: 50});
        this.text("Time: " + this.currentTime);
        this.textFont({size: "30px"});
        this.textColor("#FFFFFF");
    },

    updateTime: function() {
        this.currentTime -= 1;
        if(this.currentTime <= 10) {
            this.attr({x:Crafty.viewport.width - 155});
            this.textColor("#FF0000");
            this.textFont({size: "35px"});
        }
        if(this.currentTime <= 0 && currentBlock < maxBlock) {
            Crafty.trigger("BlockOver");
        } else if (this.currentTime <= 0 && currentBlock >= maxBlock){
            Crafty.trigger("PlayerDestroyed");
        }
        this.text("Time: " + this.currentTime)
    },

    getCurrentTime: function() {
        return this.currentTime;
    }
});

//Defines the player component
Crafty.c("Player", {
    init: function() {
        xviewport = Crafty.viewport.width,
        yviewport = Crafty.viewport.height;

        this.playerSizeX = Math.round(Variables.Player.playerSize*scaleRatio[0]),
        this.playerSizeY = Math.round(Variables.Player.playerSize*scaleRatio[1]),
        this.shoot = Variables.Player.shoot,
        this.moveSpeed = Variables.Player.moveSpeed,
        this.shootDelay = Variables.Player.shootDelay;
        
        this.addComponent("2D, Canvas, Core, Collision, Fourway, Keyboard, playerShip");
        this.attr({ x: xviewport/2, y: yviewport/2, w: this.playerSizeX, h: this.playerSizeY});
        this.fourway(this.moveSpeed);
        
        this.onHit("Enemy", function(o) {
            incrementMetricsCounter("playerHit"); //For data logging
            this.collisionProcess(o[0].obj);
            Crafty.audio.play("explosion", 1, 1);
        });

        this.onHit("EnemyProjectiles", function(o) {
            incrementMetricsCounter("playerHit");
            this.collisionProcess(o[0].obj);
            Crafty.audio.play("explosion", 1, 1);
        });

        //Colliding with an Bonus box, increases the player's score.
        this.onHit("Bonus", function(o) {
            incrementMetricsCounter("bonusCollected");
            Crafty("Score").updateScore(10);
            
            o[0].obj.destroy(); // Destroy the Bonus Object.
        });

        this.bind('EnterFrame', function(e) {
            
            //These four if statements, keep the player's spaceship within the bounds of the game screen
            if(this.x < 0) {
                this.x = 0;
            }

            if(this.y < 0) {
                this.y = 0;
            }

            if(this.y > yviewport - this.h) {
                this.y = yviewport - this.h;
            }

            if(this.x > xviewport - this.w) {
                this.x = xviewport - this.w;
            }

            //controls what happens when the spacebar is pressed. Dictates the number of shots and the shot patterns
            if(this.isDown('SPACE') && !this.shoot) {
                this.shoot = true;
                Crafty.e("PlayerProjectiles")
                    .attr({
                        x: this.x + (this.w/2) - Variables.PlayerProjectile.size/2,
                        y: this.y
                    });
                Crafty.audio.play("laser", 1, 1);
                this.timeout(this.shootTimeout, this.shootDelay);
            }
        });
    },

    shootTimeout: function() {
        this.shoot = false;
    },

    collisionProcess: function(otherEntity) {
        otherEntity.destroy();
        Crafty.trigger("RespawnPlayer", {});
        for (i=0; i < Crafty("Enemy").length; i++) {
            Crafty("Enemy").destroy();
            Crafty("EnemyProjectiles").destroy();
            Crafty("Bonus").destroy();
            Crafty("PlayerProjectiles").destroy();
        }
    }
});

//Defines the enemy component. 
Crafty.c("Enemy", {
    init: function() {
        incrementMetricsCounter("enemiesCreated");
        var xviewport = Crafty.viewport.width,
        yviewport = Crafty.viewport.height;

        this.xpos = Crafty.math.randomInt(0,xviewport),
        this.xspeed = Crafty.math.randomInt(Variables.Enemy.minXSpeed, Variables.Enemy.maxXSpeed),
        this.yspeed = Crafty.math.randomInt(Variables.Enemy.minYSpeed, Variables.Enemy.maxYSpeed),
        this.type = Crafty.math.randomInt(Variables.Enemy.minType, Variables.Enemy.maxType),
        this.shoot = Variables.Enemy.shoot,
        this.shootDelay = Variables.Enemy.shootDelay,
        this.maxCircProjectile = Variables.Enemy.maxCircProjectile,
        this.sizeX = Math.round(Variables.Enemy.size*scaleRatio[0]),
        this.sizeY = Math.round(Variables.Enemy.size*scaleRatio[1]),
        this.ypos = Variables.Enemy.ypos,
        this.angle = Variables.Enemy.angle;

        this.addComponent("2D, Canvas, Collision");
        if(this.type == 0) {
            this.addComponent("enemySpriteTypeOne");
        } else if (this.type == 1) {
            this.addComponent("enemySpriteTypeTwo");
        }

        this.attr({ x: this.xpos, y: this.ypos, w: this.sizeX, h: this.sizeY, dX: this.xspeed, dY: this.yspeed});
        
        this.bind('EnterFrame', function() {

            var centerX = this.x + (this.w/2) - Variables.EnemyProjectiles.size/2; // determine the center point of the enemy

            if(this.y > yviewport || this.x > xviewport || this.y < -this.sizeY || this.x < -this.sizeX) {
                this.destroy();
            }

            this.x += this.dX;
            this.y += this.dY;

            if(!this.shoot) {
                if(this.type === 0) {
                    this.shoot = true;

                    Crafty.e("EnemyProjectiles")
                    .attr({
                        x: centerX, // set to emit projectiles from the center point of the enemy
                        y: this.y + this.h
                    });
                    this.timeout(this.shootTimeout, this.shootDelay[this.type]);
                } else if(this.type === 1) { // emits projectiles in a circular pattern
                    this.shoot = true;

                    for(i = 0; i < this.maxCircProjectile+1; i++) {
                        var enemyCircProjectile = Crafty.e("EnemyProjectiles")
                        .attr({
                            x: centerX + Math.cos(i*this.angle),
                            y: (this.y + this.h/2 - Variables.EnemyProjectiles.size/2) + Math.sin(i*this.angle)
                        });
                        enemyCircProjectile.setTheta(i*this.angle);
                    };
                    this.timeout(this.shootTimeout, this.shootDelay[this.type]);
                }
                
            }
        });
        this.onHit("PlayerProjectiles", function(o) {
            incrementMetricsCounter("enemiesKilled");
            o[0].obj.destroy();
            this.destroy(); 
            Crafty("Score").updateScore(10);            
        });
    },

    shootTimeout: function() {
        this.shoot = false;
    }

});

//Defines the Bonus component.
Crafty.c("Bonus", {
    init: function() {
        incrementMetricsCounter("bonusCreated");
        var xviewport = Crafty.viewport.width,
        yviewport = Crafty.viewport.height;

        this.yspeed = Variables.Bonus.yspeed,
        this.unitSizeX = Math.round(Variables.Bonus.unitSize*scaleRatio[0]),
        this.unitSizeY = Math.round(Variables.Bonus.unitSize*scaleRatio[1]);

        this.addComponent("2D, Canvas, Collision, bonusSprite");
        this.attr({x: Crafty.math.randomInt(this.unitSizeX, xviewport - this.unitSizeX), y: 0, 
            w: this.unitSizeX, h: this.unitSizeY, dY: this.yspeed});

        this.bind('EnterFrame', function() {
            if(this.y > yviewport || this.x > xviewport || this.y < 0 || this.x < 0) {
                this.destroy();
            }

            this.y += this.dY;
        });
    }
});

/*
    Next two components are essentially the exact same thing. The only reason
    they were separated, was for the ease of use with Crafty's collision detection system.
    This can be changed if need be.
*/


Crafty.c("PlayerProjectiles", {
    init: function() {
        incrementMetricsCounter("playerProjectiles");

        var xviewport = Crafty.viewport.width,
        yviewport = Crafty.viewport.height; 

        this.theta = Variables.PlayerProjectile.theta,
        this.speed = Variables.PlayerProjectile.speed,
        this.sizeX = Math.round(Variables.PlayerProjectile.size*scaleRatio[0]),
        this.sizeY = Math.round(Variables.PlayerProjectile.size*scaleRatio[1]);

        this.addComponent("2D, Canvas, Collision, ppSprite");
        this.attr({w: this.sizeX, h: this.sizeY});

        this.bind("EnterFrame", function() {
            if(this.y > yviewport || this.x > xviewport || this.y < 0 || this.x < 0) {
                this.destroy();
            }

            this.x += this.speed * Math.cos(this.theta);
            this.y += this.speed * Math.sin(this.theta);
        });
    },

    setTheta: function(t) {
        this.theta = t;
    }
});

Crafty.c("EnemyProjectiles", {
    init: function() {
        incrementMetricsCounter("enemyProjectiles");
        var xviewport = Crafty.viewport.width,
        yviewport = Crafty.viewport.height;

        this.theta = Variables.EnemyProjectiles.theta,
        this.speed = Variables.EnemyProjectiles.speed,
        this.sizeX = Math.round(Variables.EnemyProjectiles.size*scaleRatio[0]),
        this.sizeY = Math.round(Variables.EnemyProjectiles.size*scaleRatio[1]);

        this.addComponent("2D, Canvas, Collision, epSprite");
        this.attr({w: this.sizeX, h: this.sizeY});

        this.bind("EnterFrame", function() {
            if(this.y > yviewport || this.x > xviewport || this.y < 0 || this.x < 0) {
                this.destroy();
            }

            this.x += this.speed * Math.cos(this.theta);
            this.y += this.speed * Math.sin(this.theta);
        });
    },

    setTheta: function(t) {
        this.theta = t;
    }
});