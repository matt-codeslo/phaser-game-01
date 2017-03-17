var game = new Phaser.Game(1024, 1024, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('starfield', 'art/background/skybox.jpg');
    game.load.image('playerShip', 'art/ships/Spaceship4.png');
    game.load.image('laser', 'art/fx/laser-green.png');
    game.load.image('enemy', 'art/ships/Spaceship1.png');
}

var player;
var background;
var laser1;
var laser2;
var cursors;
var fireButton;
var lasers;
var fireRate = 0;
var Weapon;

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

    // add enemy ship
    enemy = game.add.sprite(512, 100, 'enemy');
    enemy.scale.setTo(2.0, 2.0);
    enemy.anchor.setTo(0.5);
    // enable physics on enemy
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.angle = 180;

    //our laser group
    lasers = game.add.group();
    lasers.enableBody = true;
    lasers.physicsBodyType = Phaser.Physics.ARCADE;
    lasers.createMultiple(50, 'laser');
    lasers.setAll('anchor.x', 0.5);
    lasers.setAll('anchor.y', 1);
    lasers.setAll('checkWorldBounds', true);
    lasers.setAll('outOfBoundsKill', true);

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
    game.physics.arcade.collide(enemy, lasers, function(enemy,laser){collideScript(enemy,laser);});

    // custom collide collideScript
    function collideScript(enemy,laser){
        laser.kill();
    }

    function fire(x, double) {
        if (game.time.now > fireRate) {

            laser = lasers.getFirstExists(false);

            if (laser) {
                laser.reset(x, player.y - 10);
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