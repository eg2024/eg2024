import { Scene } from "phaser";

export class Game extends Scene {
    constructor() {
        super("hike");
    }

    init(data) {
        this.data = data;
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add and scale background image
        const backgroundImage = this.add.image(width / 2, height / 2, "hike_background");
        const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
        backgroundImage.setScale(scale).setOrigin(0.5, 0.5);

        // Back button
        let back = this.add.image(width - 40, 40, "back").setInteractive();
        back.on("pointerdown", () => this.scene.start("menu"));

        // Score text
        this.score = 0;
        this.scoreText = this.add.text(width / 2, 80, this.score.toString(), {
            font: "60px Arial",
            fill: "#ffffff",
            align: "center",
        }).setOrigin(0.5, 0.5);

        this.timeTicks = 0; // set to 2000 to start at a score of 100
        this.gameOver = false;

        // Player sprite
        this.player = this.add.sprite(47, height * 0.84, 'hike_player').setScale(1);
        this.isJumping = false;
        this.maxJumpHeight = height * 0.40; // Predefined maximum height of the jump
        this.playerInitialY = this.player.y;
        this.input.on('pointerdown', () => {
            if (this.player.y === this.playerInitialY) {  // Check if the player is on the ground
                this.isJumping = true;
                this.jumpVelocity = -5; // Initial velocity for jumping
            }
        });
        
        this.input.on('pointerup', () => {
            this.isJumping = false;  // Stop jumping when the pointer is released
        });
        
        // Initialize jump variables
        this.jumpVelocity = 0; // current velocity of player
        this.gravity = 0.2;  // Adjust gravity strength here
        this.jumpSpeed = -10; // Constant speed of rising

        this.speedDifficulty = 0.5; // set to 0.5 for easy, to 1 for normal, to 2 for super hard


        // Dinosaur group
        this.dinos = this.add.group();

        // Spawning dinos at random intervals
        this.time.delayedCall(this.randomBetween(500, 1000), this.spawnDino, [], this);

        // Update the game state
        this.time.addEvent({
            delay: 20,
            callback: () => {
                // Modify difficulty based on score
                // It should start at 0.5 and go up to 1 at about a score of 30 and then go up to about 2 by score 300
                if (this.score < 20)
                    this.speedDifficulty = this.lerp(0.5, 1, this.score/20);
                else if (this.score < 100)
                    this.speedDifficulty = 1;
                else if (this.score > 100)
                    this.speedDifficulty = this.lerp(1, 2, (this.score-100)/200);

                // Apply night tint when game has gone on long enough
                if (this.score > 100) {
                    let darkness = this.roundedSquareWave(this.timeTicks / 4000 * 3.14 * 2);
                    let grn = Math.round(this.lerp(0xff, 0x55, darkness));
                    let blu = Math.round(this.lerp(0xff, 0x44, darkness));
                    let red = Math.round(this.lerp(0xff, 0x33, darkness));
                    let colormask = grn + blu*256 + red*256*256;
                    backgroundImage.setTint(colormask);
                }


                if (!this.gameOver) {
                    this.timeTicks += 1;
                    this.score = this.timeTicks / 20;
                    let visible_score = Math.floor(this.score) * 100;
                    this.scoreText.setText(visible_score + "m");

                    this.updateJump();
                    this.updateDinos();
                }
                this.checkCollisions();
            },
            callbackScope: this,
            loop: true
        });

        if (!this.data["restart"]) {
            this.scene.launch("intro", {
                "minigame": this,
                "text": "On weekends, E&G go for adventures. With the kids this is no easy task.\n\nHelp them jump over obstacles.",
            });
            this.scene.pause();
        }
    }

    roundedSquareWave(x) {
        return Math.atan(Math.sin(x)*10);
    }

    lerp(start, end, t) {
        if (t < 0)
            return start;
        if (t > 1)
            return end;
        return (1 - t) * start + t * end;
    }

    weightedRandom(items, weights) {
        let totalWeight = weights.reduce((total, weight) => total + weight, 0);
        let randomNum = Math.random() * totalWeight;
        let weightSum = 0;
    
        for (let i = 0; i < items.length; i++) {
            weightSum += weights[i];
            if (randomNum <= weightSum) {
                return items[i];
            }
        }
    }

    spawnDino() {
        const sprites = ["hike_dino", "hike_pterodactyl", "hike_rock", "hike_treestump", "hike_tree", "hike_funicular"];
        const weights = [100,30,100,100,30,3];
    
        let sprite = this.weightedRandom(sprites, weights);
        const dino = this.add.sprite(this.game.config.width + 50, this.game.config.height * 0.73, sprite);
        dino.setScale(this.game.config.width * 0.15 / dino.width);

        dino.vx = -6;
        dino.vy = 2;

        if (sprite == "hike_tree") {
            dino.setScale(this.game.config.width * 0.15 / dino.width * 2);
            dino.y -= 20;
        }
        if (sprite == "hike_funicular") {
            dino.setScale(this.game.config.width * 0.15 / dino.width * 2);
            dino.y = this.randomBetween(this.game.config.height * 0.2, this.game.config.height * 0.45);
            dino.y -= 20;
        }
        if (sprite == "hike_dino") {
            // Make dino twice as large in rare cases
            if (Math.random() < 0.1)
                dino.setScale(this.game.config.width * 0.15 / dino.width * 2);
        }
        if (sprite == "hike_pterodactyl") {
            dino.y = this.randomBetween(this.game.config.height * 0.2, this.game.config.height * 0.5);
            dino.vx = -3;
            dino.vy = 0;
        }
        this.dinos.add(dino);

        // Schedule the next dinosaur spawn with a new random delay
        if (!this.gameOver)
            this.time.delayedCall(this.randomBetween(100 / this.speedDifficulty, 3000 / this.speedDifficulty), this.spawnDino, [], this);
    }

    updateDinos() {
        if (!this.gameOver) {
            this.dinos.getChildren().forEach(dino => {
                dino.x += dino.vx * this.speedDifficulty;
                dino.y += dino.vy * this.speedDifficulty;
            });
        }
    }

    updateJump() {
        if (this.isJumping && this.player.y > this.maxJumpHeight && !this.gameOver) {
            // While the player is holding down, and hasn't reached max height, move up
            this.player.y += this.jumpSpeed * this.speedDifficulty; // constant speed up
            this.jumpVelocity = -this.jumpSpeed; // speed to use when releasing
        } else if (!this.isJumping || this.player.y <= this.maxJumpHeight) {
            this.isJumping = false;
            // Apply gravity normally to fall
            this.jumpVelocity += this.gravity;
            this.player.y += this.jumpVelocity * this.speedDifficulty;
    
            if (this.player.y > this.playerInitialY) {
                // Stop falling and reset on the ground
                this.player.y = this.playerInitialY;
                this.jumpVelocity = 0; // Reset the velocity
            }
        }
    }
    
    
    

    checkCollisions() {
        this.dinos.getChildren().forEach(dino => {
            const playerRect = this.player.getBounds();
            const dinoRect = dino.getBounds();
            
            if (this.rectsOverlap(playerRect, dinoRect)) {
                this.gameover();
            }
        });
    }

    rectsOverlap(rectA, rectB) {
        const leniency = 0.8;
        return rectA.x < rectB.x + rectB.width * leniency &&
               rectA.x + rectA.width * leniency > rectB.x &&
               rectA.y < rectB.y + rectB.height * leniency &&
               rectA.height * leniency + rectA.y > rectB.y;
    }

    gameover() {
        if (this.gameOver) return;  // This can be called multiple times before scene is paused.
        this.gameOver = true;

        let visible_score = Math.floor(this.score) * 100;

        this.scene.launch("gameover", {
            "minigame": this,
            "text": "You helped Erik and Gabca travel " + visible_score  + "m.",
        });
        this.scene.pause();
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}
