import Phaser from 'phaser';

interface contentObject {
  platforms: Phaser.Physics.Arcade.StaticGroup
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  stars: Phaser.Physics.Arcade.Group
  bombs: Phaser.Physics.Arcade.Group
}

const initialStaticGroup = {} as Phaser.Physics.Arcade.StaticGroup
const initialSpriteWithDynamicBody = {} as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
const initialGroup = {} as Phaser.Physics.Arcade.Group

export default class Demo extends Phaser.Scene {
  static content: contentObject = {
    platforms: initialStaticGroup,
    player: initialSpriteWithDynamicBody,
    stars: initialGroup,
    bombs: initialGroup
  };

  static score: number = 0;
  static scoreText: Phaser.GameObjects.Text;
  static gameOver: boolean;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('sky', 'tempassets/sky.png');
    this.load.image('ground', 'tempassets/platform.png');
    this.load.image('star', 'tempassets/star.png');
    this.load.image('bomb', 'tempassets/bomb.png');
    this.load.spritesheet('dude',
      'tempassets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    // Add assets
    this.add.image(400, 300, 'sky');

    // Create animations
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // In game score
    Demo.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

    // Platforms
    Demo.content.platforms = this.physics.add.staticGroup();
    Demo.content.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    Demo.content.platforms.create(600, 400, 'ground');
    Demo.content.platforms.create(50, 250, 'ground');
    Demo.content.platforms.create(750, 220, 'ground');

    // Player
    Demo.content.player = this.physics.add.sprite(100, 450, 'dude');
    Demo.content.player.setBounce(0.3);
    Demo.content.player.body.setGravityY(50)
    Demo.content.player.setCollideWorldBounds(true);

    // Bombs
    Demo.content.bombs = this.physics.add.group();

    //Stars
    Demo.content.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    Demo.content.stars.children.iterate((child: any) =>
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    );

    // Physics interaction
    this.physics.add.collider(Demo.content.bombs, Demo.content.platforms);
    this.physics.add.collider(Demo.content.player, Demo.content.platforms);
    this.physics.add.collider(Demo.content.bombs, Demo.content.bombs);
    this.physics.add.collider(Demo.content.stars, Demo.content.platforms);
    this.physics.add.collider(
      Demo.content.player,
      Demo.content.bombs,
      this.onPlayerBombCollide,
      undefined,
      this
    );

    this.physics.add.overlap(
      Demo.content.player,
      Demo.content.stars,
      this.onPlayerStarOverlap,
      undefined, 
      this
    );

  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      Demo.content.player.setVelocityX(-160);
      Demo.content.player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
      Demo.content.player.setVelocityX(160);
      Demo.content.player.anims.play('right', true);
    }
    else {
      Demo.content.player.setVelocityX(0);
      Demo.content.player.anims.play('turn');
    }

    if (cursors.up.isDown && Demo.content.player.body.touching.down) {
      Demo.content.player.setVelocityY(-330);
    }
  }

  onPlayerBombCollide() {
    this.physics.pause();

    Demo.content.player.setTint(0xff0000);
    Demo.content.player.anims.play('turn');
    Demo.gameOver = true;
  }

  onPlayerStarOverlap(player: any, star: any) {
    star.disableBody(true, true)

    Demo.score += 10;
    Demo.scoreText.setText('Score: ' + Demo.score);

    if (Demo.content.stars.countActive(true) === 0) {

      Demo.content.stars.children.iterate((child: any) => {
        child.enableBody(true, child.x, 0, true, true);
      });

      let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      let bomb = Demo.content.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
}
