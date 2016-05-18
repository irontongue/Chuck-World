var Enemy = function (x, y) {
    this.sprite = new Sprite("bat.png");
    this.sprite.buildAnimation(2, 1, 88, 94, 0.3, [0, 1]);
    this.sprite.setAnimationOffset(0, -35, -40);

    this.position = new Vector2();
    this.position.Set(x, y);

    this.volocity = new Vector2();

    this.moveRight = true;
    this.pause = 0;

    for (var i = 0; i < 1; i++) {
        this.sprite.setAnimationOffset(i, -75, -89);

    }

   // this.position = new Vector2();
    //this.position.Set(9 * TILE, 0 * TILE);

    this.width = 159;
    this.height = 163;

    this.velocity = new Vector2();
    this.velocity.Set(0, 0);
    this.falling = true;
    this.jumping = false;

    this.cooldownTimer = 0;
};


var LEFT = 0;
var RIGHT = 1;




Enemy.prototype.update = function (deltaTime) {
    this.sprite.update(deltaTime);

    if (this.pause > 0) {
        this.pause -= deltaTime;
    }
    else {
        var ddx = 0; // acceleration
        var tx = pixelToTile(this.position.x);
        var ty = pixelToTile(this.position.y);
        var nx = (this.position.x) % TILE;
        var ny = (this.position.y) % TILE;
        var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
        var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
        var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
        var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

        if (this.moveRight) {
            if (celldiag && !cellright) {
                ddx = ddx + ENEMY_ACCEL;
            }
            else {
                this.velocity.x = 0;
                this.moveRight = false;
                this.pause = 0.5;

            }
        }
        if(!this.moveRight)
        {
            if(celldown && !cell) {
                ddx = ddx - ENEMY_ACCEL;
            }
            else {
                this.velocity.x = 0;
                this.moveRight = true;
                this.pause = 0.5;
            }
            this.position.x = Math.floor(this.position.x + deltaTime * this.velocity.x);
            this.velocity.x = bound(this.velocity.x + (deltaTime * ddx),
                                            -ENEMY_MAXDX, ENEMY_MAXDX);
        }
    }
    

    var METER = TILE;
    var GRAVITY = METER * 9.8 * 6;
    var MAXDX = METER * 10;
    var MAXDY = METER * 15;
    var ACCEL = MAXDX * 2;
    var FRICTION = MAXDX * 6;
    var JUMP = METER * 1500;

    var left = false;
    var right = false;
    var jump = false;
     
    
/*
    if (keyboard.isKeyDown(keyboard.KEY_LEFT) == true) {
        left = true;
        this.direction = LEFT;
        if (this.sprite.currentAnimation != ANIM_WALK_LEFT)
            this.sprite.setAnimation(ANIM_WALK_LEFT);

    }
    else if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) {
        right = true;
        this.direction = RIGHT;
        if (this.sprite.currentAnimation != ANIM_WALK_RIGHT)
            this.sprite.setAnimation(ANIM_WALK_RIGHT);

    }
    else {
        if (this.jumping == false && this.falling == false) {
            if (this.direction == LEFT) {
                if (this.sprite.currentAnimation != ANIM_IDLE_LEFT)
                    this.sprite.setAnimation(ANIM_IDLE_LEFT);
            }
            else {
                if (this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
                    this.sprite.setAnimation(ANIM_IDLE_RIGHT)

            }
        }

    }
    */
    if (keyboard.isKeyDown(keyboard.KEY_SPACE) == true) {
        jump = true;
        if (left == true) {
            this.sprite.setAnimation(ANIM_JUMP_LEFT);
        }
        if (right == true) {
            this.sprite.setAnimation(ANIM_JUMP_RIGHT);
        }
        else if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) {
            right = true;
            this.direction = RIGHT;
            if (this.sprite.currentAnimation != ANIM_WALK_RIGHT &&
                this.jumping == false)
                this.sprite.setAnimation(ANIM_WALK_RIGHT);
        }
    }


    //}

    var wasleft = this.velocity.x < 0;
    var wasright = this.velocity.x > 0;
    var falling = this.falling;

    var ddx = 0; // acceleration
    var ddy = GRAVITY;

    if (left)
        ddx = ddx - ACCEL; //player wants to go left
    else if (wasleft)
        ddx = ddx + FRICTION; //player was but no longer going left
     
    if (right)
        ddx = ddx + ACCEL;
    else if (wasright)
        ddx = ddx - FRICTION;

    if (jump && !this.jumping && !falling) {
        // apply an instantaneous (large) vertical impulse
        ddy = ddy - JUMP;
        this.jumping = true;
        if (this.direcition == LEFT)
            this.sprite.setAnimation(ANIM_JUMP_LEFT)
        else
            this.sprite.setAnimation(ANIM_JUMP_RIGHT)
    }

    this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
    this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
    this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
    this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY)

    if ((wasleft && (this.velocity.x > 0)) ||
        (wasright && (this.velocity.x < 0))) {
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
    if (this.velocity.y > 0) {
        if ((celldown && !cell) || (celldiag && !cellright && nx)) {
            this.position.y = tileToPixel(ty);
            this.velocity.y = 0
            this.falling = false;
            this.jumping = false;
            ny = 0;
        }
    }
    else if (this.velocity.y < 0) {
        if ((cell && !celldown) || (cellright && !celldiag && nx)) {
            this.position.y = tileToPixel(ty + 1);
            this.velocity.y = 0;
            cell = celldown;
            cellright = celldiag;
            ny = 0;
        }
    }
    if (this.velocity.y < 0) {
        if ((cellright && !cell) || (celldiag && !celldown && ny)) {
            this.position.x = tileToPixel(tx);
            this.velocity.x = 0;
        }
    }
    else if (this.velocity.x < 0) {
        if ((cell && !cellright) || (celldown && !celldiag && ny)) {
            this.position.x = tileToPixel(tx + 1);
            this.velocity.x = 0;
        }
    }
}



Enemy.prototype.draw = function () {

    this.sprite.draw(context,
        this.position.x - worldOffsetX,
        this.position.y);
    //    context.fillRect(player.position.x, player.position.y, 35, 35)
}
