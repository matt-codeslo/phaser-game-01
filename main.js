var game = new Phaser.Game(1024, 1024, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('starfield', 'art/background/skybox.jpg');
    game.load.image('playerShip', 'art/ships/spaceship4.png');
    game.load.image('laser', 'art/fx/laser-green.png');
}

var player;
var background;
var laser1;
var laser2;
var cursors;
var fireButton;
var lasers;
var laserTime = 0;

function create() {
    // start physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // load background
    starfield = game.add.tileSprite(0, 0, 1024, 1024, 'starfield');

    // load playerShip
    player = game.add.sprite(640, 512, 'playerShip');
    player.scale.setTo(2.0, 2.0);
    player.anchor.setTo(0.5);
    // enable physics on player
    game.physics.enable(player, Phaser.Physics.ARCADE);
    // keep player inbounds
    player.body.collideWorldBounds = true;

    // our laser group
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
        fire();
    }

    function fire() {
        if (game.time.now > laserTime) {

            laser1 = lasers.getFirstExists(false);
            laser2 = lasers.getFirstExists(false);

            if (laser1 && laser2) {
                // fire left gun
                laser1.reset(player.x - 15, player.y + 8);
                console.log('firing laser one');
                laser1.body.velocity.y = -400;
                // fire right gun
                laser2.reset(player.x + 15, player.y + 8);
                console.log('firing laser two');
                laser2.body.velocity.y = -400;
                laserTime = game.time.now + 200;

            }
        }

    }

    // // mouse movement
    // if (game.input.mousePointer.isDown)
    // {
    //     //  250 is the speed it will move towards the mouse
    //     game.physics.arcade.moveToPointer(player, 250);

    //     //  if it's overlapping the mouse, don't move any more
    //     if (Phaser.Rectangle.contains(player.body, game.input.x, game.input.y))
    //     {
    //         player.body.velocity.setTo(0, 0);
    //     }
    // }
    // else
    // {
    //     player.body.velocity.setTo(0, 0);
    // }
}