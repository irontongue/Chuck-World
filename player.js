var Player = function () {
    this.image = document.createElement("img");
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.width = 159;
    this.height = 163;
    this.velocityX = 0;
    this.velocityY = 0;
    this.angularvelocity = 0;
    this.rotation = 0;
    this.image.src = "hero.png";
};

Player.prototype.update = function (deltaTime) {
    if (typeof (this.rotation) == "undefined")
        this.rotation = 0;
    if (keyboard.isKeyDown(keyboard.KEY_SPACE) == true)  
    {
        this.rotation -= deltaTime;
        console.log("this.rotation")
    }
    else 
    {
        this.rotation += deltaTime;
        
    }
    
    if(keyboard.isKeyDown(keyboard.KEY_UP) == true)
    {
        console.log("key is donw")
    }
    
    Player.prototype.draw = function () {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation)
        context.drawImage(this.image, - this.width / 2, - this.height / 2);
        context.restore();
    }
}