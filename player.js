var Player = function () 
{
    this.sprite = new Sprite("ChuckNorris.png");
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [0, 1, 2, 3, 4, 5, 6, 7]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [8, 9, 10, 11, 12]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [52, 53, 54, 55, 56, 57, 58, 59]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [60, 61, 62, 63, 64]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
    
    for(var i=0; i<ANIM_MAX; i++)
    {
        this.sprite.setAnimationOffset(i, -75, -89);
        
    }
    
    this.position = new Vector2();
    this.position.Set (9 * TILE, 0 * TILE);

    this.width = 159;
    this.height = 163;

    this.velocity = new Vector2();
    this.velocity.Set(0,0);
    this.falling = true;
    this.jumping = false;

    
};


var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_MAX = 6;


    Player.prototype.update = function (deltaTime)
 {
     this.sprite.update(deltaTime);
     
     var METER = TILE;
     var GRAVITY = METER *9.8 * 6;
     var MAXDX = METER * 10;
     var MAXDY = METER * 15;
     var ACCEL = MAXDX * 2;
     var FRICTION = MAXDX * 6;
     var JUMP = METER * 1500;
     
     var left = false;
     var right = false;
     var jump = false;
     
     //cehck keypress eventss
     if (keyboard.isKeyDown(keyboard.KEY_LEFT) == true) {
         left = true;
         this.direction = LEFT;
         if (this.sprite.currentAnimation != ANIM_WALK_LEFT)
             this.sprite.setAnimation(ANIM_WALK_LEFT);
             console.log ("WORKS")
     }
     else if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) {
         right = true;
         this.direction = RIGHT;
         if (this.sprite.currentAnimation != ANIM_WALK_RIGHT)
             this.sprite.setAnimation(ANIM_WALK_RIGHT);
             console.log("WOKRS2")
     }
     else {
         if (this.jumping == false && this.falling == false) {
              {
                 if (this.direcition == LEFT) {
                     if (this.sprite.currentAnimation != ANIM_IDLE_LEFT)
                         this.sprite.setAnimation(ANIM_IDLE_LEFT);
                 }
                 else 
                 {
                     if (this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
                         this.sprite.setAnimation(ANIM_IDLE_RIGHT)

                 }
             }
         }
     }
     if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
     {
         jump = true;
         if(left == true) {
             this.sprite.setAnimation(ANIM_JUMP_LEFT);
         }
         if(right == true) {
             this.sprite.setAnimation(ANIM_JUMP_RIGHT);
         }
     }
     
     var wasleft = this.velocity.x < 0;
     var wasright = this.velocity.x > 0;
     var falling = this.falling;
     
     var ddx = 0; // acceleration
     var ddy= GRAVITY;
     
     if (left)
     ddx = ddx - ACCEL; //player wants to go left
     else if (wasleft)
     ddx = ddx + FRICTION; //player was but no longer going left
     
     if (right)
     ddx = ddx + ACCEL;
     else if (wasright)
     ddx = ddx - FRICTION;
     
     if (jump && !this.jumping && !falling)
     {
         // apply an instantaneous (large) vertical impulse
         ddy = ddy - JUMP;
         this.jumping = true;
         if(this.direcition == LEFT)
         this.sprite.setAnimation(ANIM_JUMP_LEFT)
         else
         this.sprite.setAnimation(ANIM_JUMP_RIGHT)
     }
     {
         ddy = ddy - JUMP;
         this.jumping = true;
         
     }
     
    this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
    this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
    this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
    this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY)
     
     if ((wasleft && (this.velocity.x > 0))||
         (wasright && (this.velocity.x < 0)))
         {
             this.velocity.x = 0;
         }
    // collision detection
    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    
    var nx = (this.position.x) % TILE;
    var ny = (this.position.y) % TILE;
    
    var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
    var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
    
    // If player has vertical velocity then check to see if they have hit a platform below or above, in which case stop their verical velocity, and clamp their y position
    if(this.velocity.y > 0 ){
        if ((celldown && !cell)|| (celldiag && !cellright && nx)){
            this.position.y = tileToPixel(ty);
            this.velocity.y = 0
            this.falling = false;
            this.jumping = false;
            ny = 0;
        }
    }
    else if (this.velocity.y <0) {
        if ((cell && !celldown) || (cellright && !celldiag && nx)) {
            this.position.y = tileToPixel(ty + 1);
            this.velocity.y = 0;
            cell = celldown;
            cellright = celldiag;
            ny = 0;
        }
    }
    if (this.velocity.y < 0) {
        if ((cellright && !cell ) || (celldiag && !celldown && ny)){
            this.position.x = tileToPixel(tx);
            this.velocity.x = 0;
        }
    }
    else if (this.velocity.x < 0){
        if ((cell && !cellright) || (celldown && !celldiag && ny)) {
            this.position.x = tileToPixel(tx + 1);
            this.velocity.x = 0;
        }
    }
 }
 


Player.prototype.draw = function()
{
	/*    context.save();			
		context.translate(this.position.x, this.position.y);
		context.drawImage(this.image, -50,-90);	
	    context.restore();
      */  this.sprite.draw(context, this.position.x, this.position.y);
        context.fillStyle = '#0000ff'	
        context.fillRect(player.position.x, player.position.y, 35, 35)
}
