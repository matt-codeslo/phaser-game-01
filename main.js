var game = new Phaser.Game(1024, 1024, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('starfield', 'art/background/skybox.jpg');
    game.load.image('playerShip', 'art/ships/Spaceship4.png');
    game.load.image('laser', 'art/fx/laser-green.png');
    game.load.image('enemy', 'art/ships/Spaceship3.png');
    game.load.spritesheet('explosion', 'art/fx/explosion-01.png', 64, 64, 14);
}

var player;
var enemies;
var background;
var cursors;
var fireButton;
var lasers;
var fireRate = 0;
var explosions;

function create() {
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
    function spawnEnemy(numOfEnemies) {
        if (numOfEnemies > 0) {
            var randTime = getRandom(1000, 1500);
            console.log(randTime);
            var x = game.rnd.integerInRange(50, game.width - 50);
            var y = -100;
            var sendEnemies = new Promise(function (resolve, reject) {
                var enemy = enemies.getFirstExists(false);
                if (enemy) {
                    enemy.reset(x, y);
                    enemy.checkWorldBounds = true; // without this can't check if sprite is in bounds
                    enemy.events.onOutOfBounds.add(hasLeftBottom, this); // this adds a custom callback
                    enemy.body.velocity.y = 250;
                }
                resolve(1);
            });

            sendEnemies.then(function (result) {
                setTimeout(function () {
                    spawnEnemy(numOfEnemies - 1);
                }, randTime);
            });

        }

    }
    // kill enemies if they leave bottom of screen
    function hasLeftBottom(enemy) {
        if (enemy.body.y > game.height) {
            enemy.kill();
        }
    }

    function getRandom(min, max) {
        return randTime = game.rnd.integerInRange(min, max);
    }

    // generate those enemies
    spawnEnemy(10);
}

function update() {
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
        player.body.velocity.x = -250;

        // todo: animations would be good
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 250;
    } else if (cursors.up.isDown) {
        player.body.velocity.y = -250;
    } else if (cursors.down.isDown) {
        player.body.velocity.y = 250;
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
    game.physics.arcade.collide(enemies, lasers, function (enemy, laser) { enemyExplodes(enemy, laser); });

    // custom collide collideScript
    function enemyExplodes(enemy, laser) {
        laser.kill();
        enemy.body.velocity.y = 0;
        var explosion = explosions.getFirstExists(false);
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.play('explosion', 30, false, true); // name, 30fps, don't loop, kill when done
        enemy.kill();
    }

    function fire(x, double) {
        if (game.time.now > fireRate) {

            laser = lasers.getFirstExists(false);

            if (laser) {
                laser.reset(x, player.y + 10);
                laser.body.velocity.y = -500;
                if (double) {
                    fireRate = 0;
                } else {
                    fireRate = game.time.now + 200;
                }

            }
        }

    }





}

