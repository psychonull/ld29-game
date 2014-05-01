(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 570, Phaser.AUTO, 'ld29');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('lose', require('./states/lose'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":14,"./states/gameover":15,"./states/lose":16,"./states/menu":17,"./states/play":18,"./states/preload":19}],2:[function(require,module,exports){

var PlayerStateManager = require('../utils/playerStateManager');

'use strict';

var Beginning = function(game, state) {
  Phaser.Group.call(this, game);

  //company assets
  var compAssets = this.game.add.image(0, 350, 'start', 'company_assets');
  compAssets.scale.x = 0.75;
  compAssets.scale.y = 0.75;
  this.add(compAssets);
  
  this.add(this.game.add.bitmapText(35, 365, 'minecraftia', 'COMPANY', 12));
  this.add(this.game.add.bitmapText(40, 380, 'minecraftia', 'ASSETS', 12));

  this.add(this.game.add.bitmapText(40, 440, 'minecraftia', window.formatNumber(state.surplusGold, 8), 16));

  //happiness on sale
  var saleX = 95;
  var saleY = 170;
  var sales = this.game.add.image(saleX, saleY, 'start', 'freedom_sight');
  sales.scale.x = 0.9;
  sales.scale.y = 0.9;
  this.add(sales);
  
  this.add(this.game.add.bitmapText(saleX + 62, saleY + 22, 'minecraftia', 'SALE!!', 14));
  this.add(this.game.add.bitmapText(saleX + 62, saleY + 42, 'minecraftia', 'freedom tickets', 10));
  this.add(this.game.add.bitmapText(saleX + 62, saleY + 65, 'minecraftia', 
    window.formatNumber(PlayerStateManager.GOLD_REQUIRED_FOR_FREEDOM, 6), 20));

  //my savings
  var savingX = 350;
  var savingY = 160;
  var savings = this.game.add.image(savingX, savingY, 'start', 'savings_sight');
  savings.scale.x = 0.9;
  savings.scale.y = 0.75;
  this.add(savings);
  
  this.add(this.game.add.bitmapText(savingX + 12, savingY + 45, 'minecraftia', 'MY SAVINGS', 14));
  this.add(this.game.add.bitmapText(savingX + 15, savingY + 65, 'minecraftia', window.formatNumber(state.freedomGold, 6), 16));
};

Beginning.prototype = Object.create(Phaser.Group.prototype);
Beginning.prototype.constructor = Beginning;

Beginning.prototype.update = function() {

};

module.exports = Beginning;

},{"../utils/playerStateManager":21}],3:[function(require,module,exports){
'use strict';
var BlinkingText = function(game, text, fill, period) {
  Phaser.Group.call(this, game);

  this.text = this.game.add.bitmapText(0, 0, 'minecraftia_white', text || 'EXAMPLE', 46);
  this.text.tint = fill || 0xFF0000;
  this.add(this.text);
  
  this.period = period || 200;
  this._timer = 0;
  this._running = false;

  this.timer = this.game.time.events.loop(Phaser.Timer.SECOND * 0.1 , function(){
    this.text.visible = !this.text.visible;
  }, this);

};

BlinkingText.prototype = Object.create(Phaser.Group.prototype);
BlinkingText.prototype.constructor = BlinkingText;

BlinkingText.prototype.update = function() {
 
};

BlinkingText.prototype.start = function(){
  this.timer.timer.start();
}

BlinkingText.prototype.stop = function(){
  this.timer.timer.stop();
}

module.exports = BlinkingText;
},{}],4:[function(require,module,exports){
'use strict';

var Cart = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'cart', frame);

  this.inputEnabled = true;

  game.physics.arcade.enable(this);

  this.currentVelocity = 0;
  this.facing = 1;
  this.jumpOnCollide = 10;

  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
  this.anchor.setTo(0.5, 0.5);

  // cart cannot go away from World
  this.body.collideWorldBounds = true;

  this.nextMove = 0;
  this.moveRate = 200;
  this.moveSize = 50;

  this.cursors = game.input.keyboard.createCursorKeys();
  this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(35, 30, 0, 10);

  this.currentRail = 3;

  this.enabled = true;

  this.collectedStuff = new Phaser.Signal();
  this.collidedObstacle = new Phaser.Signal();
  this.collidedStartingPoint = new Phaser.Signal();
  this.collided = false;

  this.gold = 0;

  this.animations.add('empty', [0,1,2,3,4], true);
  this.animations.add('filled', [5,6,7,8,9]);
  this.animations.play('empty');

  this.collideSound = this.game.add.audio('collide');
  this.collideSound.volume = 0.3;
  this.collideShortSound = this.game.add.audio('collide_short');
  this.collideShortSound.volume = 0.3;
  this.collideStartingSound = this.game.add.audio('collide_starting');
  this.collideStartingSound.volume = 0.3;

  this.emitter = this.game.add.emitter(50, 50, 10);
};

Cart.prototype = Object.create(Phaser.Sprite.prototype);
Cart.prototype.constructor = Cart;

Cart.prototype.init = function(state){
  this.currentRail = state.railCartIndex;
  this.moveToRail(this.currentRail, true);
}

Cart.prototype.update = function() {
  this.body.velocity.x = this.currentVelocity * this.facing;
  
  var canMove = this.enabled && (this.game.time.now > this.nextMove) && this.currentVelocity !== 0;
  var hasMove = false;

  if ((this.cursors.up.isDown || this.wKey.isDown || this.pointerDown() == -1) && canMove) {
    hasMove = this.moveToRail(this.currentRail - 1);
  }
  else if ((this.cursors.down.isDown || this.sKey.isDown || this.pointerDown() == 1) && canMove) {
    hasMove = this.moveToRail(this.currentRail + 1);
  }

  if (hasMove){
    this.nextMove = this.game.time.now + this.moveRate;
    this.shootParticles('chips');
  }

  if (this.collided){
    var duration = 100;
    this.game.add.tween(this).to({angle: 20 * this.facing}, duration, Phaser.Easing.Quadratic.InOut, true, 0, false);
    this.game.add.tween(this).to({angle: 10 * this.facing * -1}, duration, Phaser.Easing.Quadratic.OutIn, true, duration*2, false);
    this.game.add.tween(this).to({angle: 0}, duration, Phaser.Easing.Quadratic.OutIn, true, duration*3, false);
    this.collided = false;
  }

  if (this.body.velocity.x === 0){
    this.animations.stop();
  }
  else {
    this.animations.play(this.gold > 0 ? 'filled' : 'empty', 12, true); 
  }
};

Cart.VELOCITY_REDUCTION_ON_RAIL_MOVEMENT = 0.9;

Cart.prototype.pointerDown = function(){
  if(!this.game.input.activePointer.isDown){
    return 0;
  }
  else {
    if(this.game.input.activePointer.position.x < this.game.height / 2){
      return -1;
    }
    else{
      return 1;
    }
  }
};

Cart.prototype.moveToRail = function(railIndex, noAminate){  
  var nextRail = this.rails.children[railIndex];
  if(nextRail){

    if (noAminate){
      this.y = nextRail.getCartY();
      this.currentRail = railIndex;  
    }
    else {
      var nextY = nextRail.getCartY();

      var duration = 40;
      this.body.velocity.x = this.body.velocity.x * Cart.VELOCITY_REDUCTION_ON_RAIL_MOVEMENT;

      this.game.add.tween(this)
        .to({y: nextY}, duration*3, Phaser.Easing.Quadratic.OutIn, true, 0, false)
        .onComplete.add(function(){
          this.currentRail = railIndex;
          this.body.velocity.x = this.body.velocity.x * (1/Cart.VELOCITY_REDUCTION_ON_RAIL_MOVEMENT);
        }, this);

      this.game.add.tween(this).to({angle: 20 * this.facing * -1}, duration, Phaser.Easing.Quadratic.InOut, true, 0, false);
      this.game.add.tween(this).to({angle: 20 * this.facing}, duration, Phaser.Easing.Quadratic.OutIn, true, duration*2, false);
      this.game.add.tween(this).to({angle: 10 * this.facing * -1}, duration, Phaser.Easing.Quadratic.OutIn, true, duration*3, false);
      this.game.add.tween(this).to({angle: 0}, duration, Phaser.Easing.Quadratic.OutIn, true, duration*4, false);
    }

    return true;
  }
  return false;
};

Cart.prototype.shootParticles = function(type){
  switch(type){
    case "chips":
      this.emitter.x = this.x;
      this.emitter.y = this.y;

      this.emitter.makeParticles('chips', [0,1,2,3], 5, true, true);

      var velX = this.currentVelocity * this.facing;
      this.emitter.minParticleSpeed.setTo(velX * 0.5, -100);
      this.emitter.maxParticleSpeed.setTo(velX * 1.5, -300);

      this.emitter.minParticleScale = 0.2;
      this.emitter.maxParticleScale = 0.5;
      this.emitter.setAlpha(1, 0);
      this.emitter.gravity = 500;
      this.emitter.bounce.setTo(0.5, 0.5);
      this.emitter.angularDrag = 30;

      this.emitter.start(true, 8000, 0, 10);
      break;
  }
};

Cart.prototype.animateText = function(text){

  var x = this.x;
  var y = this.y;
  
  var txt = this.game.add.bitmapText(x + (100*this.facing), y, 'minecraftia_white', text.toString() , 30);
  txt.tint = 0xFF0000;
  this.game.add.tween(txt).to({alpha: 0, y: y-100, x: x + (this.facing*this.currentVelocity) }, 750, Phaser.Easing.Quadratic.InOut, true, 0, false);
};

Cart.prototype.animateTextGold = function(text){
  
  var x = this.x;
  var y = this.y-50;
  
  var txt = this.game.add.bitmapText(x, y, 'minecraftia_white', text.toString() , 30);
  txt.tint = 0xf3c907;
  this.game.add.tween(txt).to({alpha: 0, y: y-200 }, 1500, Phaser.Easing.Quadratic.InOut, true, 0, false);
  //this.game.add.tween(txt).to(properties, duration, ease, autoStart, delay, repeat, yoyo);
};

Cart.prototype.checkCollisions = function(railsGroup){
  //this.game.debug.body(this);

  var obstacles = railsGroup.getObstacleGroups();
  for(var i = 0; i < obstacles.length; i++){
    //this.game.debug.body(obstacles[i]);
    this.game.physics.arcade.collide(this, obstacles[i], collisionHandler, null, this);
  }

  function collisionHandler(cart, obstacle){
    if(obstacle.data.type === 'win'){
      this.facing = -1;
      this.collectedStuff.dispatch(this.game.rnd.integerInRange(10,1000));
    }
    else if(obstacle.data.type === 'start'){
      this.collideStartingSound.play();
      this.facing = 1;
      this.collidedStartingPoint.dispatch();
    }
    else {
      if(this.game.rnd.integerInRange(1,2) === 1){
        this.collideSound.play();
      }
      else {
        this.collideShortSound.play();
      }
      this.shootParticles('chips');
      this.collidedObstacle.dispatch(obstacle.data.loseFactor, obstacle);
      this.x += this.jumpOnCollide * this.facing;
    }
    
    this.collided = true;
  }
};

module.exports = Cart;

},{}],5:[function(require,module,exports){
'use strict';
var BlinkingText = require('./blinkingText');

var Ending = function(game) {
  this._running = false;
  Phaser.Group.call(this, game);

  this.add(this.game.add.image(-50, 295, 'end', 'floor_right'));

  var gold = this.game.add.image(100, 300, 'end', 'gold_pile');
  this.add(gold);
  gold.inputEnabled = true;

  this.goldClick = new Phaser.Signal();
  gold.events.onInputDown.add(this.clickGold, this);

  this.goldEmitter = this.game.add.emitter(200, 350, 10);
  this.add(this.goldEmitter);

  this.space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  this.space_key.onDown.add(this.clickGold, this);

  this.collectText = new BlinkingText(this.game, 'COLLECT');
  this.collectText.x = 200;
  this.collectText.y = 20;
  this.add(this.collectText);
  this.collectText.start();
  this.coinPickupSound = this.game.add.audio('coinPickup');
  this.coinPickupSound.volume = 0.3;
};

Ending.prototype = Object.create(Phaser.Group.prototype);
Ending.prototype.constructor = Ending;

Ending.prototype.clickGold = function() {
  if(!this._running){
    return;
  }
  
  this.coinPickupSound.play();  

  this.goldClick.dispatch();

  this.goldEmitter.x = this.game.rnd.integerInRange(120,280);
  
  this.goldEmitter.makeParticles('gold', [0,1,2,3], 3, true, true);

  this.goldEmitter.minParticleSpeed.setTo(-200, -300);
  this.goldEmitter.maxParticleSpeed.setTo(200, -400);
  this.goldEmitter.minParticleScale = 0.2;
  this.goldEmitter.maxParticleScale = 1;
  this.goldEmitter.gravity = 150;
  this.goldEmitter.bounce.setTo(0.5, 0.5);
  this.goldEmitter.angularDrag = 30;

  this.goldEmitter.start(true, 8000, 0, 0);
};

Ending.prototype.update = function() {

};

Ending.prototype.start = function(){
  this._running = true;
};

Ending.prototype.end = function(){
  this._running = false;
};

module.exports = Ending;

},{"./blinkingText":3}],6:[function(require,module,exports){
'use strict';
var Minimap = require('./minimap'),
  PlayerStateManager = require('../utils/playerStateManager');

var Hud = function(game) {
  this._score = 0;
  Phaser.Group.call(this, game);

  this.y = 535;
  this.fixedToCamera = true;

  this.scoreText = this.game.add.bitmapText(10, 0, 'minecraftia_white', window.formatNumber(0, 6), 30);
  this.add(this.scoreText);

  this.timer = this.game.add.bitmapText(0, 0, 'minecraftia','30.00', 22);
  this.timer.x = this.game.width * 0.9 - this.timer.textWidth / 2;
  this.timer.visible = false;
  this.add(this.timer);

  this.minimap = new Minimap(this.game);
  this.minimap.x = this.game.width * 0.35;
  this.minimap.y = 7;
  this.add(this.minimap);

  this.timerExpired = new Phaser.Signal();
  this.playerLost = new Phaser.Signal();

  this.score(0);
};

Hud.prototype = Object.create(Phaser.Group.prototype);
Hud.prototype.constructor = Hud;

Hud.prototype.update = function() {
  if (this._cowntdownTimeStarted){
    this.updateTimer();
  }
};

Hud.prototype.score = function(amountToAdd){
  if(typeof amountToAdd == 'undefined'){
    return this._score;
  }
  else {
    this._score += amountToAdd;
    if(amountToAdd > 0){
      this.runScoreUpAnimation(amountToAdd);
    }
    else if (amountToAdd < 0){
      this.runScoreDownAnimation(amountToAdd);
    }
    if(this._score < 0){
      this.scoreText.tint = 0xFF0000;
    }
    else{
      this.scoreText.tint = 0xF2F201;
    }
    this.scoreText.setText('$ ' + window.formatNumber(this._score, 6));

    if (this._score < PlayerStateManager.LOSE_THRESHOLD){
      this.playerLost.dispatch();
    }
    
  }
};

Hud.prototype.runScoreUpAnimation = function(amt){

};

Hud.prototype.runScoreDownAnimation = function(amt){

};

Hud.prototype.startCowntdown = function(miliseconds){
  this._remainingTime = miliseconds;
  this._cowntdownTimeStarted = this.game.time.time;
};

Hud.prototype.stopCowntdown = function(){
  this._cowntdownTimeStarted = null;
  this.timerExpired.dispatch();
};

Hud.prototype.updateTimer = function(){
  var remaining = this._remainingTime - (this.game.time.time - this._cowntdownTimeStarted);
  if (remaining <= 0){
    remaining = 0;
    this.stopCowntdown();
  }
  var seconds = Math.floor(remaining / 1000) % 60;
  var milliseconds = Math.floor(remaining) % 100;
  if (milliseconds < 10)
      milliseconds = '0' + milliseconds;
  if (seconds < 10)
      seconds = '0' + seconds;

  this.timer.setText(seconds + '.' + milliseconds);
 
};

Hud.prototype.updateMinimap = function(cart, rails){
  this.minimap.updateProgress(cart, rails);
};

module.exports = Hud;

},{"../utils/playerStateManager":21,"./minimap":10}],7:[function(require,module,exports){
'use strict';

var LayerBack = function(game) {
  Phaser.Group.call(this, game);

  this.bgPos = 140;

  this.generateSky();
  this.generateBg();
  this.createStart();
};

LayerBack.prototype = Object.create(Phaser.Group.prototype);
LayerBack.prototype.constructor = LayerBack;

LayerBack.prototype.update = function() {
  this.sky.tilePosition.x = -this.game.camera.x;
  this.bg.tilePosition.x = -this.game.camera.x;
};

LayerBack.prototype.generateSky = function(){
  this.sky = this.game.add.tileSprite(0, 0, 800, 80, 'envBgs');
  this.sky.fixedToCamera = true;
  this.add(this.sky);
};

LayerBack.prototype.generateBg = function(){
  this.bg = this.game.add.tileSprite(0, this.bgPos, 800, 160, 'envBgs');
  this.bg.tilePosition.y = -240;
  this.bg.fixedToCamera = true;
  this.add(this.bg);
};

LayerBack.prototype.createStart = function(){
  this.add(this.game.add.image(30, this.bgPos, 'start', 'stair'));
  this.add(this.game.add.image(30, this.bgPos + 80, 'start', 'stair'));

  this.add(this.game.add.image(15, this.bgPos, 'start', 'light'));
};

module.exports = LayerBack;

},{}],8:[function(require,module,exports){
'use strict';

var LayerFront = function(game) {
  Phaser.Group.call(this, game);
  
  this.surfaceTop = 100;
  this.surfaceBot = 490;

  this.add(this.game.add.image(-42, 295, 'end', 'floor_left'));

  this.generateTop();
  this.generateBot();
};

LayerFront.prototype = Object.create(Phaser.Group.prototype);
LayerFront.prototype.constructor = LayerFront;

LayerFront.prototype.update = function() {
  this.top.tilePosition.x = -this.game.camera.x;
  this.bot.tilePosition.x = -this.game.camera.x;
};

LayerFront.prototype.generateTop = function(){
  this.top = this.game.add.tileSprite(0, this.surfaceTop, 800, 80, 'envBgs');
  this.top.tilePosition.y = -160;
  this.top.fixedToCamera = true;
  this.add(this.top);
};

LayerFront.prototype.generateBot = function(){
  this.bot = this.game.add.tileSprite(0, this.surfaceBot, 800, 80, 'envBgs');
  this.bot.tilePosition.y = -400;
  this.bot.fixedToCamera = true;
  this.add(this.bot);
};


module.exports = LayerFront;

},{}],9:[function(require,module,exports){
'use strict';

var LayerGame = function(game) {
  Phaser.Group.call(this, game);

  this.grassPos = 65;

  this.generateGrass();
};

LayerGame.prototype = Object.create(Phaser.Group.prototype);
LayerGame.prototype.constructor = LayerGame;

LayerGame.prototype.update = function() {
  this.grass.tilePosition.x = -this.game.camera.x;  
};

LayerGame.prototype.generateGrass = function(){
  this.grass = this.game.add.tileSprite(0, this.grassPos, 800, 80, 'envBgs');
  this.grass.tilePosition.y = -480;
  this.grass.fixedToCamera = true;
  this.add(this.grass);

  this.add(this.game.add.image(30, 40, 'start', 'hole'));
};

module.exports = LayerGame;

},{}],10:[function(require,module,exports){
'use strict';

var Minimap = function(game) {
  Phaser.Group.call(this, game);

  this.x = this.game.width * 0.35;
  this.y = 7;

  this.minimap = this.game.add.tileSprite(0, 0, 300, 15, 'envFront', 'bg');
  this.add(this.minimap);
  this.overlay = this.game.add.tileSprite(0, 0, 300, 15, 'envFront', 'surfaceTop');
  this.add(this.overlay);

  this.minimapCart = this.game.add.sprite(-20, -15, 'cart');
  this.minimapCart.scale.x = 0.45;
  this.minimapCart.scale.y = 0.45;
  this.add(this.minimapCart);
  this.setPosition(0);
};

Minimap.prototype = Object.create(Phaser.Group.prototype);
Minimap.prototype.constructor = Minimap;

Minimap.prototype.update = function() {
};

Minimap.prototype.setPosition = function(pos){
	var width = this.minimap.width;
	var newPos = width * pos;
  	this.overlay.width = newPos;

	this.minimapCart.x =  newPos - 20;
};

Minimap.prototype.updateProgress = function(cart, rails){
	var elapsed = (cart.x - rails.x);
	var percentage = elapsed / rails.getEstimatedWidth(); 
	this.setPosition(percentage);
};


module.exports = Minimap;

},{}],11:[function(require,module,exports){
'use strict';
var ObstacleTypes = require('../utils/obstacleTypes');

var Obstacle = function(game, x, y, id) {

  this.data = ObstacleTypes.getById(id);

  Phaser.Sprite.call(this, game, x, y, this.data.res, this.data.frame);


  // initialize your prefab here

};

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Obstacle;

},{"../utils/obstacleTypes":20}],12:[function(require,module,exports){
'use strict';
var Obstacle = require('./obstacle');

var Rail = function(game, map) {
  Phaser.Group.call(this, game);

  this.max = 17;
  this.railsPool = this.game.add.group();
  this.add(this.railsPool);

  this.obstaclesPool = {};
  
  this.generateRail(map);
  this.facing = 1;
};

Rail.prototype = Object.create(Phaser.Group.prototype);
Rail.prototype.constructor = Rail;

Rail.prototype.update = function() {

};

Rail.prototype.generateRail = function(map){
  this.regenerate2(map, 0, this.max);
};

Rail.prototype.getSpriteIndex = function(){
  var idxs = [0,0,3,0,0,3,0,0,3,0,0,0,1,2,3];
  return this.game.rnd.pick(idxs);
};

Rail.prototype.doRegenerate = function(map, i){
  
  var rail = this.railsPool.getFirstDead();

  if (rail){
    rail.revive();
    rail.reset(i * 50, 0);
  }
  else {
    var rail = this.game.add.image(i * 50, 0, 'env', 'rail_' + this.getSpriteIndex());
    rail.checkWorldBounds = true;
    rail.outOfBoundsKill = true;
    rail.anchor.setTo(0.5, 0);
    this.railsPool.add(rail);        
  }

  if(map[i]){
    this.addObstacle(map, i);
  }
};

Rail.prototype.regenerate2= function(map, from, to){
  if (from < to){
    this.facing = 1;
    for(var i = from; i < to; i ++){
      this.doRegenerate(map, i);
    }
  }
  else {
    this.facing = -1;
    for(var i = from; i >= to; i --){
      this.doRegenerate(map, i);
    }
  }
};

Rail.prototype.getCartY = function(){
  return this.y + this.parent.y + 50 - 10;
};

Rail.prototype.addObstacle = function(map, i){
  var obstacleId = map[i];
  var pool = this.getObstaclePool(obstacleId);
  var obstacle = pool.getFirstDead();

  if(obstacle){
    obstacle.revive();
    obstacle.reset(i * 50, 0);
  }
  else {
    obstacle = new Obstacle(this.game, i * 50, 0, obstacleId);
    obstacle.anchor.setTo(0.5, 0);

    this.game.physics.enable(obstacle, Phaser.Physics.ARCADE);
    obstacle.body.immovable = true;
    obstacle.body.setSize(35, 30, 0, 30);

    pool.add(obstacle);
  }
  
};

Rail.prototype.killOld = function(){
  this.railsPool.forEach(this.killImageIfDead, this);
  //this.killOldObstacles();
};

Rail.prototype.killOldObstacles = function(){ 
  //we could reuse obstacles when coming back
  for (var o in this.obstaclesPool){
    this.obstaclesPool[o].forEachAlive(this.killImageIfDead, this);
  }
};

Rail.prototype.killImageIfDead = function(r){
  var KILLOFFSET = 500;
  if(this.facing === 1){
    if(r.x + KILLOFFSET < this.game.camera.view.x){
      r.kill();
    }
  }
  else{
    if(this.game.camera.view.x + this.game.camera.view.width < r.x - KILLOFFSET ){
      r.kill();
    }
  }
};

Rail.prototype.getObstaclePool = function(obstacleName){
  if(!this.obstaclesPool[obstacleName]){
    this.obstaclesPool[obstacleName] = this.game.add.group();
    this.obstaclesPool[obstacleName].enableBody = true;
    this.obstaclesPool[obstacleName].physicsBodyType = Phaser.Physics.ARCADE;
    this.add(this.obstaclesPool[obstacleName]);
  }
  return this.obstaclesPool[obstacleName];
};

module.exports = Rail;

},{"./obstacle":11}],13:[function(require,module,exports){
'use strict';
var Rail = require('./rail');
var CLEANUP_INTERVAL = 100; 

var Rails = function(game, map) {
  this.map = map;
  Phaser.Group.call(this, game);
  

  this.lastGenerated = 0;
  this.facing = 1;
  this.y = 270;
  this.x = 350;
  
  this.lastViewX = -1;
  this.lastPos = { from:-1, to: -1};
  this.lastGen = { from:-1, to: -1};

  this.generateRails(map);
  this.cleanupTimer = 0;
};

Rails.prototype = Object.create(Phaser.Group.prototype);
Rails.prototype.constructor = Rails;

Rails.RAILS_SEPARATION = 50;
Rails.RAILS_COUNT = 4;

Rails.prototype.update = function() {
  if(typeof this.lastGenerated === 'undefined'){
    this.lastGenerated = 0;
  }

  this.handleCleanup();

  if (this.game.camera.view.x !== this.lastViewX){
    this.lastViewX = this.game.camera.view.x;

    var nextCamRails = this.nextCameraViewToRails(this.game.camera.view);
    if (nextCamRails.from !== this.lastPos.from || nextCamRails.to !== this.lastPos.to){
      this.lastPos = {
        from: nextCamRails.from,
        to: nextCamRails.to
      };

      if(this.facing === 1){
        if(this.lastGenerated < nextCamRails.to && this.lastGenerated !== this.map[0].length){
          if(nextCamRails.to > this.map[0].length){
            this.generateRails(this.map, this.map[0].length);
          }
          else{
            this.generateRails(this.map,nextCamRails.to);
          }
        }
      }
      else if(this.facing === -1){
        if(this.lastGenerated > nextCamRails.from && this.lastGenerated >= 0){
          if(nextCamRails.from < 0){
            this.generateRails(this.map, 0);
          }
          else{
            this.generateRails(this.map, nextCamRails.from);
          }
        }
      }

    }
  }
};

Rails.prototype.generateRails = function(map, to){

  if (this.lastGenerated !== this.lastGen.from || to !== this.lastGen.to){
    this.lastGen = {
      from: this.lastGenerated,
      to: to
    };

    for(var i = 0; i < Rails.RAILS_COUNT; i++){
      if (this.children[i]){
        this.children[i].regenerate2(map[i], this.lastGenerated, to);
      }
      else {
        var rail = new Rail(this.game, map[i]);
        rail.y = i * Rails.RAILS_SEPARATION;
        this.game.add.existing(rail);
        this.add(rail);
      }
    }

    this.lastGenerated = to;
  }
};

Rails.prototype.getLast = function(){
  return this.children[this.length - 1];
};

Rails.prototype.setFacing = function(facing){
  this.facing = facing;
};

Rails.prototype.getObstacleGroups = function(){
  var obstacles = [];
  for(var i = 0; i < this.children.length; i++){
    var child = this.children[i];
    for(var obsName in child.obstaclesPool){
      obstacles.push(child.obstaclesPool[obsName].children);
    }
  } 

  return obstacles;
};

Rails.prototype.nextCameraViewToRails = function(view){
  var spriteWidth = 50;
  var cameraTiles = Math.round(view.width / 50);
  var starting = Math.round(view.x / 50);
  var ending = starting + (cameraTiles);

  return {
    from: starting + cameraTiles * this.facing,
    to: ending + cameraTiles * this.facing
  };
};

Rails.prototype.getEstimatedWidth = function(){
  return this.map[0].length * 50;
};

Rails.prototype.handleCleanup = function(){
  if(this.cleanupTimer < CLEANUP_INTERVAL){
    this.cleanupTimer += this.game.time.elapsed;
  }
  else{
    this.callAll('killOld');
    this.cleanupTimer = 0;
  }
};

module.exports = Rails;
},{"./rail":12}],14:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],15:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],16:[function(require,module,exports){
'use strict';
var PlayerStateManager = require('../utils/playerStateManager');

  function Lose() {}
  Lose.prototype = {
    preload: function() {
      // Override this method to add some load operations. 
      // If you need to use the loader, you may need to use them here.
    },
    create: function() {
      this.game.stage.backgroundColor = '#000';
      this.lostText = this.game.add.bitmapText(0, 150, 'minecraftia_white','YOU LOST', 52);
      this.lostText.align = 'center';
      this.lostText.x = this.game.width / 2 - this.lostText.textWidth / 2;
      this.lostText.tint = 0xFF1100;


      this.awayText1 = this.game.add.bitmapText(50, this.lostText.y + 100, 'minecraftia_white','you were only', 22);
      this.awayAmountText = this.game.add.bitmapText(this.awayText1.x + this.awayText1.textWidth + 10, 
                                                    this.lostText.y + 100, 
                                                    'minecraftia_white','$' + this.getGoldRemainingForFreedom(), 22);
      this.awayAmountText.tint = 0xF8F801;
      this.awayText2 = this.game.add.bitmapText(this.awayAmountText.x + this.awayAmountText.textWidth + 10, 
                                                this.awayText1.y, 
                                                'minecraftia_white','away from freedom.', 22);

      this.textInstructions = this.game.add.bitmapText(this.lostText.x, 
                                                this.awayText1.y + 100, 
                                                'minecraftia_white','Click to start over again', 15);

    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.restartGame();
      }
    },
    paused: function() {
      // This method will be called when game paused.
    },
    render: function() {
      // Put render operations here.
    },
    shutdown: function() {
      // This method will be called when the state is shut down 
      // (i.e. you switch to another state from this one).
    },
    restartGame: function(){
      this.game.playerState = new PlayerStateManager();
      this.game.state.start('play');    
    },
    getGoldRemainingForFreedom: function(){
      return PlayerStateManager.GOLD_REQUIRED_FOR_FREEDOM - this.game.playerState.freedomGold;
    }
  };
module.exports = Lose;

},{"../utils/playerStateManager":21}],17:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    this.game.stage.backgroundColor = '#61e1e9';
    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'cart');
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.x = 20;
    this.sprite.scale.y = 20;
    this.sprite.smoothed = false;

    this.playText = this.game.add.bitmapText(0, 300, 'minecraftia_white','PLAY', 46);
    this.playText.align = 'center';
    this.playText.x = this.game.width / 2 - this.playText.textWidth / 2;
    this.playText.y = this.game.height / 2 - this.playText.textHeight / 2;
    
    this.instructionsText = this.game.add.bitmapText(270, 365, 'minecraftia', 'Click to begin. \n Use W/S or Up/Down to move. Click or Space to collect', 16);
    this.instructionsText.align = 'center';
    this.instructionsText.x = this.game.width / 2 - this.instructionsText.textWidth / 2;

    this.sprite.angle = -20;
    this.game.add.tween(this.sprite).to({angle: 20}, 300, Phaser.Easing.Quadratic.InOut, true, 0, 300, true);

    //this.game.sound.mute = true;
    this.audioFx = this.game.add.audio('playSfx');
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.pregameGlitch(function(){
        this.game.state.start('play');
      });
    }
  },
  pregameGlitch: function(done){
    var colors = ['#61e1e9','#967750','#584635'],
        timer = this.game.time.create(false),
        eventCount = 0;
    this.audioFx.volume = 0.5;
    this.audioFx.play();
    this.game.add.tween(this.audioFx).to({volume: 0}, 400, Phaser.Easing.Linear.In, true, 0, 0, false);
    var execEvent = function(){
      this.game.stage.backgroundColor = this.game.rnd.pick(colors);
      eventCount++;
      if (eventCount < 15){
        timer.add(this.game.rnd.integerInRange(50, 150), execEvent, this);
      }
      else {
        timer.stop();
        done.call(this);
      }
    };

    timer.loop(this.game.rnd.integerInRange(50, 150), execEvent, this);
    timer.start();
  }
};

module.exports = Menu;

},{}],18:[function(require,module,exports){
'use strict';

var Cart = require('../prefabs/cart'),
    Rails = require('../prefabs/rails'),
    RailsMapGenerator = require('../utils/railsMapGenerator'),
    LayerBack = require('../prefabs/layers/back'),
    LayerFront = require('../prefabs/layers/front'),
    LayerGame = require('../prefabs/layers/game'),
    Hud = require('../prefabs/hud'),
    Beginning = require('../prefabs/beginning'),
    Ending = require('../prefabs/ending'),
    PlayerStateManager = require('../utils/playerStateManager');

function Play() {}

Play.prototype = {
  create: function() {
    this.initPlayerState();
    this.cartingStarted = false;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //  Resize our game world to be a 2000 x 800 square
    this.game.world.setBounds(0, 0, 50000, this.game.height);

    this.layerBack = new LayerBack(this.game);
    this.game.add.existing(this.layerBack);

    this.layerGame = new LayerGame(this.game);
    this.game.add.existing(this.layerGame);

    this.rails = new Rails(this.game, RailsMapGenerator.generate(this.game.playerState));
    this.game.add.existing(this.rails);

    this.layerFront = new LayerFront(this.game);
    this.game.add.existing(this.layerFront);

    this.cart = new Cart(this.game, 400, 0, this.rails);
    this.cart.rails = this.rails;

    this.cart.collectedStuff.add(function(amt){
      this.rails.setFacing(-1);
      
      this.cart.currentVelocity = 0;
      this.hud.startCowntdown(this.game.playerState.getCollectTime());
      this.hud.timer.visible = true;
      this.ending.start();
      
      this.hud.timerExpired.add(function(){
        // If blow up, put back .to({x: 500}
        this.game.add.tween(this.game.camera.deadzone).to({x: 750}, 1000, Phaser.Easing.Linear.NONE, true, 0, 0, false);
        this.cart.currentVelocity = this.game.playerState.getCartSpeed();
        this.ending.end();
        this.hud.timer.visible = false;
      }, this);

    }, this);

    this.cart.collidedObstacle.add(function(amt){
      var lostGold = amt * this.game.playerState.getRandomBaseGoldAMountToDrop();
      this.hud.score(lostGold);
      this.cart.gold = this.hud.score();
      this.cart.animateText(lostGold);
    }, this);

    this.cart.init(this.game.playerState);

    this.cart.collidedStartingPoint.add(function(){
      this.rails.setFacing(1);
      this.game.camera.follow(null);
      this.cart.currentVelocity = 0;
      this.cartingStarted = false;

      this.game.state.restart(false);
      this.game.playerState.railCartIndex = this.cart.currentRail;
      this.game.playerState.dumpGold(this.hud.score());

    }, this);
    
    this.game.add.existing(this.cart);
    this.game.camera.focusOnXY(0, 0);

    this.beginning = new Beginning(this.game, this.game.playerState);
    this.game.add.existing(this.beginning);

    this.ending = new Ending(this.game);
    this.game.add.existing(this.ending);
    this.ending.x = this.rails.x + this.rails.getEstimatedWidth();

    this.ending.goldClick.add(function(){
      var goldEarned = this.game.playerState.getRandomGoldAmountToPick();
      this.cart.gold += goldEarned; //Gold to sum for each click
      this.cart.animateTextGold("+" + goldEarned);
      this.hud.score(goldEarned);
    }, this);

    // Show FPS
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
        20, 20, 'FPS', { font: '12px helvetica', fill: '#ffffff' }
    );
    this.fpsText.fixedToCamera = true;

    this.hud = new Hud(this.game);
    this.hud.playerLost.add(function(){
      this.game.state.start('lose');
    }, this);
    this.game.add.existing(this.hud);

    //  Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    var self = this;
    this.game.input.onDown.add(function(){
      if(!self.cartingStarted){
        self.startCarting();
      }
    })

    this.game.input.keyboard.onDownCallback = function(){
      if(!self.cartingStarted){
        self.startCarting();
      }
    };

    this.game.stage.backgroundColor = "#000";
    if(!this.game.bgm){
      this.game.bgm = this.game.add.audio('bgm');
      this.game.bgm.play('', 0, 0.7, true);  
    }

  },
  update: function() {
    // Show FPS
    if (this.game.time.fps !== 0) {
      this.fpsText.setText(this.game.time.fps + ' FPS' + " /// " + this.game.camera.x);
    }

    if (this.cart.currentVelocity !== 0){
      this.hud.updateMinimap(this.cart, this.rails);
    }

    this.cart.checkCollisions(this.rails);
  },
  startCarting: function(){
    this.cartingStarted = true;
    var moveCamTween = this.game.add.tween(this.game.camera).to({x: this.cart.x - 100}, 400, Phaser.Easing.Linear.In, true, 0, 0, false);
    moveCamTween.onComplete.add(function(){
      this.cart.body.velocity.x = this.game.playerState.getCartSpeed();
      this.cart.currentVelocity = this.game.playerState.getCartSpeed();
      this.game.camera.follow(this.cart);
      this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 10, 10);
    }, this);
  },
  initPlayerState: function(){
    if(!this.game.playerState){
      this.game.playerState = new PlayerStateManager();
    }
    this.game.playerState.gamesPlayed++;
  }
};

module.exports = Play;
},{"../prefabs/beginning":2,"../prefabs/cart":4,"../prefabs/ending":5,"../prefabs/hud":6,"../prefabs/layers/back":7,"../prefabs/layers/front":8,"../prefabs/layers/game":9,"../prefabs/rails":13,"../utils/playerStateManager":21,"../utils/railsMapGenerator":22}],19:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.game.width/2,this.game.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.text = this.game.add.text(325,this.game.height/2 + 70, "LOADING...");
    this.text.font = 'Arial';
    this.text.fontWeight = 'bold';
    this.text.fontSize = 30;
    this.text.fill = '#ffffff';


    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    
    this.load.spritesheet('cart', 'assets/cart.png', 80, 80, 10);  
    this.load.spritesheet('gold', 'assets/gold.png', 64, 64, 4);

    this.load.spritesheet('chips', 'assets/particles.png', 10, 10, 4);

    this.load.atlas('env', 'assets/env_tiles.png', 'assets/env_tiles.json');
    this.load.atlas('envFront', 'assets/env_tiles_front.png', 'assets/env_tiles_front.json');
    this.load.image('envBgs', 'assets/env_bg_tiles.png');
    this.load.atlas('start', 'assets/start.png', 'assets/start.json');
    this.load.atlas('end', 'assets/end.png', 'assets/end.json');

    this.game.load.bitmapFont('minecraftia', 'assets/fonts/minecraftia.png', 'assets/fonts/minecraftia.xml');
    this.game.load.bitmapFont('minecraftia_white', 'assets/fonts/minecraftia_white.png', 'assets/fonts/minecraftia_white.xml');

    this.game.load.audio('playSfx', 'assets/sounds/mainMenuPlay.wav');
    this.game.load.audio('bgm', 'assets/sounds/ld29bgm.mp3');
    this.game.load.audio('coinPickup', 'assets/sounds/coinPickup.wav');
    this.game.load.audio('collide', 'assets/sounds/Collide.wav');
    this.game.load.audio('collide_short', 'assets/sounds/Collide short.wav');
    this.game.load.audio('collide_starting', 'assets/sounds/Starting.wav');

    window.formatNumber = function(nbo, zeros){
      function pad (str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
      }

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      var attach = "";
      if (nbo < 0){
        nbo *= -1;
        attach = "-";
      }
      return attach + numberWithCommas(pad(nbo, zeros || 6));
    };
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}],20:[function(require,module,exports){
ObstacleTypes = {
	"1" : {
		res: "cart",
		type: "lose",
		loseFactor: 2
	},
	"2" : {
		res: "env",
		frame: "floor",
		type: "lose",
		loseFactor: 1	
	},
	"3" : {
		res: "env",
		frame: "rock",
		type: "lose",
		loseFactor: 1	
	},
	"4" : {
		res: "env",
		frame: "plant",
		type: "lose",
		loseFactor: 1	
	},
	"-1" : {
		res: "env",
		frame: "stop_right",
		type: "win"
	},
	"-2" : {
		res: "env",
		frame: "stop_left",
		type: "start"
	}
};

ObstacleTypes.getById = function(id){
	return ObstacleTypes[id];
};

ObstacleTypes.getAvailableIds = function(){
	return [1, 2, 3, 4];
};

ObstacleTypes.WIN_ID = -1;
ObstacleTypes.START_ID = -2;

module.exports = ObstacleTypes;
},{}],21:[function(require,module,exports){
'use strict';

var game = Phaser.GAMES[0];

var PlayerStateManager = function(){
  this.gamesPlayed = 0;
  this.gamesLost = 0;

  this.freedomGold = 0;
  this.surplusGold = 0;

  this.railCartIndex = 3;
};

PlayerStateManager.prototype = {
  addFreedomGold: function(amt){
    this.freedomGold += amt;
  },
  addSurplusGold: function(amt){
    this.surplusGold += amt;
  },
  dumpGold: function(amt){
    if(amt > 0){
      this.addFreedomGold(Math.round(amt * 0.1));
      this.addSurplusGold(Math.round(amt * 0.9));
    }
    else {
      // losses to the worker
      this.addFreedomGold(amt);
    }
  },
  getRandomGoldAmountToPick: function(){
    //if()
    return this.gamesPlayed * game.rnd.integerInRange(100, 500);
  },
  getRandomBaseGoldAMountToDrop: function(){
    // THIS WILL BE MULTIPLIED BY THE OBSTACLE RATE
    return game.rnd.integerInRange(-1000, -10);
  },
  getCartSpeed: function(){
    var speed = 750;
    if ( this.gamesPlayed == 1){
      speed = 400;
    }
    else if(this.gamesPlayed > 1 && this.gamesPlayed < 5){
      speed = 500;
    }
    else if(this.gamesPlayed >= 5 && this.gamesPlayed < 10){
      speed = 600;
    }
    else if(this.gamesPlayed >= 10 && this.gamesPlayed < 15){
      speed = 700;
    }
    else if(this.gamesPlayed >= 15 && this.gamesPlayed < 20){
      speed = 800;
    }
    else {
      speed = 900 * (this.gamesPlayed / 6);
    }
    if(speed > PlayerStateManager.MAX_SPEED){
      return PlayerStateManager.MAX_SPEED;
    }
    return speed;
  },
  getCollectTime: function(){
    if(this.gamesPlayed == 1){
      return 3000
    }
    else{
      return 1000;
    }
  },
  getMapLength: function(){
    return Math.min(25 * (this.gamesPlayed), PlayerStateManager.MAX_MAP_LENGTH);
  }
};

PlayerStateManager.LOSE_THRESHOLD = -6666;
PlayerStateManager.GOLD_REQUIRED_FOR_FREEDOM = 100000;
PlayerStateManager.MAX_SPEED = 1000;
PlayerStateManager.MAX_MAP_LENGTH = 800;

module.exports = PlayerStateManager;
},{}],22:[function(require,module,exports){
'use strict';
var Rails = require('../prefabs/rails'),
	Rail = require('../prefabs/rail'),
	ObstacleTypes = require('./obstacleTypes');

var game = Phaser.GAMES[0];

var RailsMapGenerator = {
	startingOffset: 6,

	generate: function(state){
		var obstacles = ObstacleTypes.getAvailableIds(),
			width = this.getLength(state),
			difficulty = this.getDifficulty(state);
		var map = [[],[],[],[]];
		for (var i = 0; i < map.length; i++){
			map[i].push(ObstacleTypes.START_ID);
			this.addOffset(map[i]);
			for(var j = 0; j < width; j++){
				map[i].push(Math.round(Math.random() * 50 / difficulty) === 0 ? game.rnd.pick(obstacles) : 0);
			}
			map[i].push(ObstacleTypes.WIN_ID);
		}
		return map;
	},

	addOffset: function(array){
		for(var i = 0; i < this.startingOffset; i++){
			array.push(0);
		}
	},

	getDifficulty: function(state){
		var dif = 1;
		var BASE_DIFICULTY = 3;
		if (state.gamesPlayed < 5){
			dif = BASE_DIFICULTY + Math.round(state.gamesPlayed) + 2;
		}
		else if(state.gamesPlayed >= 5 && state.gamesPlayed < 10){
	      	dif = BASE_DIFICULTY + Math.round(state.gamesPlayed) - 1;
	    }
	    else if(state.gamesPlayed >= 10 && state.gamesPlayed < 15){
	      dif =  7
	    }
	    else {
	    	dif = 10;
	    }
	    return Math.min(dif, 15);
		//return BASE_DIFICULTY + Math.round(state.gamesPlayed / 3)
	},

	getLength: function(state){
		return state.getMapLength();
	}

};



module.exports = RailsMapGenerator;
},{"../prefabs/rail":12,"../prefabs/rails":13,"./obstacleTypes":20}]},{},[1])