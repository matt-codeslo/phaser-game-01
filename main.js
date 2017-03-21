var game = new Phaser.Game(1024, 1024, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('starfield', 'art/background/skybox.jpg');
    game.load.image('playerShip', 'art/ships/Spaceship4.png');
    game.load.image('laser', 'art/fx/laser-green.png');
    game.load.image('enemy', 'art/ships/Spaceship3.png');
    game.load.spritesheet('explosion', 'art/fx/explosion-01.png', 64, 64, 14);
}

var points1 = { "x": [0,200,400,600,800,1000], "y": [0,400,800,400,50,100] };
var points2 = {"x":[1000,800,600,400,200,0], "y":[0,400,800,400,50,100]};
var player;
var enemies;
var background;
var cursors;
var fireButton;
var lasers;
var laserSpeed = 550;
var fireRate = 0; // needs to be zero here
var explosions;
var playerSpeed = 350;
var enemySpeed = 250;
var explosion;
var increment = 2.5;

function create() {


    function plot(points) {
        var path = [];
        var x = increment / game.width;
        for (var i = 0; i <= 1; i += x) {
            var px = game.math.catmullRomInterpolation(points.x, i);
            var py = game.math.catmullRomInterpolation(points.y, i);
            path.push({ x: px, y: py });
        }

        return path;
    }
    // start physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // load background
    starfield = game.add.tileSprite(0, 0, 1024, 1024, 'starfield');

    // load playerShip
    player = game.add.sprite(512, 512, 'playerShip');
    player.scale.setTo(2.0, 2.0);
    player.anchor.setTo(0.5);
    // enable physics on player
    game.physics.enable(player, Phaser.Physics.ARCADE);
    // keep player inbounds
    player.body.collideWorldBounds = true;

    // mor enemies
    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    enemies.createMultiple(10, 'enemy');
    enemies.setAll('anchor.x', 0.5);
    enemies.setAll('anchor.y', 0.5);
    enemies.setAll('scale.x', 2.0);
    enemies.setAll('scale.y', 2.0);
    enemies.setAll('angle', 180);
    enemies.setAll('pathPosition', 1); // this is a custom value for motion path
    enemies.setAll('path',[]);


    //our laser group
    lasers = game.add.group();
    lasers.enableBody = true;
    lasers.physicsBodyType = Phaser.Physics.ARCADE;
    lasers.createMultiple(50, 'laser');
    lasers.setAll('anchor.x', 0.5);
    lasers.setAll('anchor.y', 1);
    lasers.setAll('checkWorldBounds', true);
    lasers.setAll('outOfBoundsKill', true);

    //explosions!
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(function (explosion) {
        explosion.animations.add('explosion');
    });

    // create enemies
    function spawnEnemy(numOfEnemies,points) {
        if (numOfEnemies > 0) {
            // a promise that handles enemy spawning
            var sendEnemies = new Promise(function (resolve) {
                var enemy = enemies.getFirstExists(false);
                if (enemy) {
                    enemy.checkWorldBounds = true; // without this can't check if sprite is in bounds
                    enemy.events.onOutOfBounds.add(hasLeftBottom, this); // this adds a custom callback
                    enemy.points = points; // stores a series of xy coordinates
                    enemy.path = plot(points); // stores a motion path
                    enemy.pathPosition = 0; // tracks what index value of path enemy is referencing
                    var x = enemy.path[0].x;
                    var y = enemy.path[0].y;
                    enemy.reset(x, y);
                }
                resolve(1);
            });

            // calls the promise and sets a success result.
            sendEnemies.then(function (result) {
                setTimeout(function () {
                    spawnEnemy(numOfEnemies - 1,points);
                }, 1000);
            });

        }

    }
    // dispose enemies if they leave bottom of screen
    function hasLeftBottom(enemy) {
        if (enemy.body.y > game.height) {
            enemy.kill();
        }
    }

    function getRandom(min, max) {
        return randTime = game.rnd.integerInRange(min, max);
    }



    // generate those enemies
    spawnEnemy(5,points1);
    spawnEnemy(5,points2);


} // end create function

function update() {
    enemies.children.forEach(function (enemy) {
        var path = enemy.path;
        if(path[enemy.pathPosition]){
        game.physics.arcade.moveToXY(
            enemy,
            path[enemy.pathPosition].x,
            path[enemy.pathPosition].y,
            250,
            500
        );
         enemy.pathPosition++;
    }
    else{
        enemy.body.velocity.x = 0;
        enemy.body.velocity.y = 300;

    }
    });


    // scroll background
    starfield.tilePosition.y += 2;
    // add cursor keys for movement
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Reset the players velocity
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    // enable movement
    if (cursors.left.isDown) {
        player.body.velocity.x = playerSpeed * -1;
    } else if (cursors.right.isDown) {
        player.body.velocity.x = playerSpeed;
    } else if (cursors.up.isDown) {
        player.body.velocity.y = playerSpeed * -1;
    } else if (cursors.down.isDown) {
        player.body.velocity.y = playerSpeed;
    }
    else {
        // stop moving
    }

    // enable shooting
    if (fireButton.isDown) {
        fire(player.x - 15, true);
        fire(player.x + 15, false);
    }

    // lasers should collide with enemies. Only lasers that hit enemy should be destroyed.
    game.physics.arcade.collide(enemies, lasers, function (enemy, laser) { enemyCollision(enemy, laser); });

    // enemy ships collide with playerShip. This should destroy both ships
    game.physics.arcade.collide(enemies, player, function (enemy, player) { enemyCollision(player, enemy); });


    // custom collide collideScript
    function enemyCollision(sprite1, sprite2) {
        if (sprite2.key === 'laser') {
            sprite2.kill();
        } else {
            sprite2.body.velocity.y = 0;
            explosion = explosions.getFirstExists(false);
            explosion.reset(sprite2.body.x + sprite2.body.halfWidth, sprite2.body.y + sprite2.body.halfHeight);
            explosion.body.velocity.y = sprite2.body.velocity.y;
            explosion.play('explosion', 30, false, true); // name, 30fps, don't loop, kill when done
            sprite2.kill();
        }
        sprite1.body.velocity.y = 0;
        explosion = explosions.getFirstExists(false);
        explosion.reset(sprite1.body.x + sprite1.body.halfWidth, sprite1.body.y + sprite1.body.halfHeight);
        explosion.body.velocity.y = sprite1.body.velocity.y;
        explosion.play('explosion', 30, false, true); // name, 30fps, don't loop, kill when done
        sprite1.kill();
    }

    function fire(x, double) {
        if (game.time.now > fireRate) {

            laser = lasers.getFirstExists(false);

            if (laser) {
                laser.reset(x, player.y + 10);
                laser.body.velocity.y = laserSpeed * -1;
                if (double) {
                    fireRate = 0;
                } else {
                    fireRate = game.time.now + 200;
                }

            }
        }

    }

} // end update function

