var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime() {
    endFrameMillis = startFrameMillis;
    startFrameMillis = Date.now();

    // Find the delta time (dt) - the change in time since the last drawFrame
    // We need to modify the delta time to something we can use.
    // We want 1 to represent 1 second, so if the delta is in milliseconds
    // we divide it by 1000 (or multiply by 0.001). This will make our 
    // animations appear at the right speed, though we may need to use
    // some large values to get objects movement and rotation correct
    var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
    // validate that the delta is within range
    if (deltaTime > 1)
        deltaTime = 1;

    return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var splashTimer = 3;

var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var enemies = [];

var LAYER_COUNT = 3; // The number of layers in the map
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2
var LAYER_OBJECT_TRIGGERS
var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJEXT_TRIGGERS = 4;
var MAP = {tw: 60, th: 15 }; // How big the level is (in tiles)
var TILE = 35 // the width and height of a tile (in pixels)
var TILESET_TILE = TILE * 2 // width and height of a tile in the tileset
var TILESET_PADDING = 2; // pixels between tile images (inside the tile map)
var TILESET_SPACING = 2; // pixels between the tile images in the tilemap
var TILESET_COUNT_X = 14; // colums of tile imageees in the tilemap
var TILESET_COUNT_Y = 14; // rows of tile images in the tilemap

var TestEnemy

//hud var
var score = 0;
var lives = 3;

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_WIN = 3;
var gameState = STATE_SPLASH

var player = new Player();
var keyboard = new Keyboard();
// abitrary choice for 1m
var METER = TILE;
// exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 6
// max horizontal speeeeed (10 tiles per second)
var MAXDX = METER * 10;
//max  vertical speed  (15 t ps)
var MAXDY = METER * 15; 
// horizontal acceleration - take 1/2 sec to reach maxdx
var ACCEL = MAXDX * 2;
// horizontal friction - take 1/6 sec to stop from maxdx
var FRICTION = MAXDX * 6
// a large instant jump impulse
var JUMP = METER * 1500;

//loads the image to use for thee level tiles
var tileset = document.createElement("img");
tileset.src = "tileset.png";

var musicBackground;
var sfxFire;


function cellAtPixelCoord(layer, x,y)
{
    if(x<0  || x>SCREEN_WIDTH)
    return 1;
    // let the player drop of the bottom of the screen (aka DEATH)
    if(y>SCREEN_HEIGHT)
    return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y));
    gameState = 3;
};

function cellAtTileCoord(layer, tx, ty)
{
    if(tx<0 || tx>=MAP.tw)
    return 1;
    // let the player drop of the screen (again meaning DEATH)
    if(ty>=MAP.th)
    return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
    return tile * TILE;
};

function pixelToTile(pixel)
{
    return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
    if(value < min)
    return min;
    if(value > max)
    return max;
    return value;
}


var worldOffsetX = 0;
function drawMap() {
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    var tileX = pixelToTile(player.position.x);
    var offsetX = TILE + Math.floor(player.position.x%TILE);
    
     startX = tileX - Math.floor(maxTiles / 2);
    if(startX < -1)
    {
        startX = 0;
        offsetX = 0;
    }
    if(startX > MAP.tw - maxTiles)
    {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    worldOffsetX = startX * TILE + offsetX;
    
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
    {
        for (var y = 0; y < level1.layers[layerIdx].height; y++) 
        {   
            var idx = y * level1.layers[layerIdx].width+startX;
            for (var x = startX; x < startX + maxTiles; x++)
           { 
             if (level1.layers[layerIdx].data[idx] != 0) {
                 var tileIndex = level1.layers[layerIdx].data[idx] - 1;
                 var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
                 var sy = TILESET_PADDING + (Math.floor(tileIndex/TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
                 context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,(x-startX)* TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
                 
             }
             idx++;
           } 
        }
    }
    
}



// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var cells = [];  // this is the array that holds the simplified collision data
function initialize() {
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
        cells[layerIdx] = [];
        cells[LAYER_OBJECT_TRIGGERS] = [];
        var idx = 0;
        
        for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++) {
                cells[LAYER_OBJECT_TRIGGERS][y] = [];
                for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) {
                        if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) {
                            cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
                            cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
                            cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
                            cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
                         }
                         else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) {
                         cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
                         }
        for(var y = 0; y < level1.layers[layerIdx].height; y++) {
            cells[layerIdx][y] = [];
            for(var x = 0; x <level1.layers[layerIdx].width; x++) {
               if(layerIdx == LAYER_ENEMIES )
               {
                   if(level1.layers[layerIdx].data[idx] != 0){
                       var tempenemy = new Enemy(x * TILE, y * TILE);
                       enemies.push(tempenemy);
                   }
               }
               else
               { if(level1.layers[layerIdx].data[idx] != 0) {
                    cells[layerIdx][y][x] = 1;
                    cells[layerIdx][y-1][x] = 1;
                    cells[layerIdx][y-1][x+1] = 1;
                    cells[layerIdx][y][x+1] =1 ;
                    
                }
                else if(cells[layerIdx][y][x] != 1) {
                    cells[layerIdx][y][x] = 0;
                }
                   
               }
           
                idx++;
            }
        }
    }
    musicBackground = new Howl({
        urls:["background.ogg"],
        loop: true,
        buffer: true,
        volume: 0.0
    } );
    musicBackground.play();
    
    sfxFire = new Howl({
        urls: ["fireEffect.ogg"],
        buffer:true,
        volume: 0.1,
        onend: function () {
            isSfxPlaying = false
        }
    });
    
     // TestEnemy = new Enemy(TILE*11, TILE*0);
    //TestEnemy.position.set(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
        
    
    
}

function runSplash(deltaTime)
{
    score = 0;
    splashTimer -= deltaTime;
    if(splashTimer <= 0)
    {
        gameState = STATE_GAME;
        return;
    }
    context.fillSyle = "#000";
    context.font="24px Arial";
    context.fillText("Get Ready, Starting Game", 200, 240);
}
function runGame(deltaTime)
{
    // player.update(deltaTime)
    
    drawMap();
  // DrawLevelCollisionData(1);
    player.update(deltaTime);
    player.draw();
    //TestEnemy.update(deltaTime);
    //TestEnemy.draw();
      for(var i=0; i<enemies.length; i++)
    {
    enemies[i].update(deltaTime);
    enemies[i].draw();
    }
}

function runGameOver(deltaTime)
{
    context.fillStyle = "black";
    context.fillText("Game Over", 200, 240);
    context.fillText("Score ="+score.toString(), 30, 30);
}
function runWin(deltaTime)
{
    context.fillStyle = "black";
    context.fillText("You Win!", 200, 240);
    context.fillText("score ="+score.toString(), 30, 30)
}


function run() {
    context.fillStyle = "darkgrey";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var deltaTime = getDeltaTime();
    
    gameState == 0;
    switch(gameState)
    {
        case STATE_SPLASH:
        runSplash(deltaTime);
        break;
        case STATE_GAME:
        runGame(deltaTime);
        break
        case STATE_GAMEOVER:
        runGameOver(deltaTime);
        break;
        case STATE_WIN:
        runWin(deltaTime);
        break;
    }
 
    
    // update the frame counter
    fpsTime += deltaTime;
    fpsCount++;
    if (fpsTime >= 1) {
        fpsTime -= 1;
        fps = fpsCount;
        fpsCount = 0;
    }
    /* draw the FPS
    context.fillStyle = "#f00";
    context.font = "14px Arial";
    context.fillText("FPS: " + fps, 5, 20, 100);
   */ 
     context.fillStyle = "purple"
    context.font="16px Arial";
    var scoreText = + score;
    context.fillText(scoreText, 60, 50)
    
    //lives
    for(var i=0; i<lives; i++)
    {
   //   context.drawImage(heart, 20 + ((heart.width+2)*i), 10);
    }
 
 
}


   

initialize();

function DrawLevelCollisionData(tileLayer) {
    for (var y = 0; y < level1.layers[tileLayer].height; y++) {
        for (var x = 0; x < level1.layers[tileLayer].width; x++) {
            if (cells[tileLayer][y][x] == 1) {
                context.fillStyle = "#F00";
                context.fillRect(TILE * x, TILE * y, TILE, TILE);
            }
        }
    }
}



//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function () {
    var onEachFrame;
    if (window.requestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.requestAnimationFrame(_cb); }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.mozRequestAnimationFrame(_cb); }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / 60);
        }
    }

    window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
