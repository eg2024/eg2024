import { Scene } from "phaser";

export class Game extends Scene {
    constructor() {
        super("hike");
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add and scale background image
        this.backgroundImage = this.add.image(width / 2, height / 2, "hike_background");
        const scale = Math.max(width / this.backgroundImage.width, height / this.backgroundImage.height);
        this.backgroundImage.setScale(scale).setOrigin(0.5, 0.5);

        // Back button
        let back = this.add.image(width - 40, 40, "back").setInteractive();
        back.on("pointerdown", () => this.scene.start("menu"));

        // Score text
        this.score = 0;
        this.scoreText = this.add.text(width / 2, 80, this.score.toString(), {
            font: "80px Arial",
            fill: "#ffffff",
            align: "center",
        }).setOrigin(0.5, 0.5);

        this.timeTicks = 0; // set to 2000 to start at a score of 100
        this.gameOver = false;

        // Players
        let klara = this.add.sprite(0, 0, 'hike_player3').setScale(1);
        let gabca = this.add.sprite(0, 0, 'hike_player2').setScale(1);
        let erik =  this.add.sprite(0, 0, 'hike_player1').setScale(1);
        this.players = [klara, gabca, erik];

        // Adjust positions
        klara.x = klara.width/2;
        gabca.x = klara.x + klara.width/2 + gabca.width/2;
        erik.x = gabca.x + gabca.width/2 + erik.width/2 - 5;
        erik.y = height * 0.84;
        gabca.y = erik.y + (erik.height - gabca.height)/2;
        klara.y = erik.y + (erik.height - klara.height)/2;
        erik.y -= 5;

        this.isJumping = [false,false,false];
        this.maxJumpHeight = height * 0.40; // Predefined maximum height of the jump
        this.groundLevel = erik.y + erik.height/2;

        //alert(this.isOnGround(0) + " " + this.isOnGround(1) + " " + this.isOnGround(2));

        this.pointerHistory = Array(10).fill(false);
        this.pointeriscurrentlydown = false;
        this.input.on('pointerdown', () => this.pointeriscurrentlydown = true);
        this.input.on('pointerup', () => this.pointeriscurrentlydown = false);

        // Initialize jump variables
        this.jumpVelocity = [5,5,5]; // current velocity of player
        this.gravity = 0.2;  // Adjust gravity strength here
        this.jumpSpeed = -10; // Constant speed of rising
        this.playerInitialY = [klara.y, gabca.y, erik.y];

        this.speedDifficulty = 1; // set to 0.5 for easy, to 1 for normal, to 2 for super hard

        // Dinosaur group
        this.dinos = this.add.group();

        // Spawning dinos at random intervals
        this.time.delayedCall(this.randomBetween(500, 1000), this.spawnDino, [], this);

        // Update the game state
        this.time.addEvent({
            delay: 20,
            callback: () => {
                this.updatePointerHistory(this.pointeriscurrentlydown);

                this.adjustDifficulty();

                this.applyDayNightCycle();

                if (!this.gameOver) {
                    this.timeTicks += 1;
                    this.score = this.timeTicks / 20;
                    this.scoreText.setText(Math.floor(this.score.toString()));

                    this.updateJump();
                    this.updateDinos();
                }
                this.checkCollisions();
            },
            callbackScope: this,
            loop: true
        });
    }

    isOnGround(playerId) {
        return this.players[playerId].y + this.players[playerId].height/2 >= this.groundLevel;
    }

    hasReachedMaxHeight(playerId) {
        return this.players[playerId].y + this.players[playerId].height/2 <= this.maxJumpHeight;
    }

    updatePointerHistory(isdown) {
        // Add the current pointer state to the history
        this.pointerHistory.unshift(isdown);
    
        // Ensure pointerHistory always has exactly 10 elements
        if (this.pointerHistory.length > 10) {
            this.pointerHistory.pop();
        }
    }

    // Modify difficulty based on score
    // It should start at 0.5 and go up to 1 at about a score of 30 and then go up to about 2 by score 300
    adjustDifficulty() {
        if (this.score < 50)
            this.speedDifficulty = this.lerp(0.5, 1, this.score/50);
        else if (this.score < 100)
            this.speedDifficulty = 1;
        else if (this.score > 100)
            this.speedDifficulty = this.lerp(1, 2, (this.score-100)/200);
    }

    applyDayNightCycle() {
        // Apply night tint when game has gone on long enough
        if (this.score > 100) {
            // The value below oscillates between 0.5 and 1
            let darkness = (this.roundedSquareWave(this.timeTicks / 4000 * 3.14 * 2)+1)/4.0 + 0.5;
            let grn = Math.round(this.lerp(0xff, 0x55, darkness));
            let blu = Math.round(this.lerp(0xff, 0x44, darkness));
            let red = Math.round(this.lerp(0xff, 0x33, darkness));
            let colormask = grn + blu*256 + red*256*256;
            this.backgroundImage.setTint(colormask);
        }
    }

    // oscillates between -1 and 1 but is more square than a sine wave.
    // starts at 0 and is increasing. has a period of 2pi.
    roundedSquareWave(x) {
        return Math.atan(Math.sin(x)*10)*2/Math.PI;
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
        const sprites = ["hike_dino", "hike_pterodactyl", "hike_rock", "hike_treestump", "hike_tree", "hike_funicular", "hike_geometry_dash"];
        const weights = [100,30,100,100,30,3,3];
    
        let sprite = this.weightedRandom(sprites, weights);
        const dino = this.add.sprite(this.game.config.width + 50, this.game.config.height * 0.73, sprite);
        dino.setScale(this.game.config.width * 0.15 / dino.width);

        dino.vx = -6;
        dino.vy = 2;
        dino.rotation_speed = 0;

        if (sprite == "hike_tree") {
            dino.setScale(this.game.config.width * 0.15 / dino.width * 2);
            dino.y -= 20;
        }
        if (sprite == "hike_rock") {
            dino.rotation_speed = -8; // degrees per frame
        }
        if (sprite == "hike_geometry_dash") {
            dino.setScale(this.game.config.width * 0.15 / dino.width * 0.5);
            dino.y -= 5;
            dino.rotation_speed = -11; // degrees per frame
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
                if (dino.rotation_speed != 0) {
                    dino.angle += dino.rotation_speed;
                }
            });
        }
    }

    updateJump() {
        if (this.gameOver)
            return;

        let jumpDelays = [6, 3, 0]; // Delays for each player
        if (!this.players[2].active) {
            jumpDelays = [3, 0, 0];
            if (!this.players[1].active)
                jumpDelays = [0,0,0];
        }

        this.players.forEach((player, i) => {
            if (this.pointerHistory[jumpDelays[i]]) {
                if (this.isOnGround(i)) {
                   this.isJumping[i] = true;
                }
            }
            else
                this.isJumping[i] = false; // Stop jumping when the pointer is released

            if (this.isJumping[i] && !this.hasReachedMaxHeight(i)) {
                // While the player is holding down, and hasn't reached max height, move up
                player.y += this.jumpSpeed * this.speedDifficulty; // constant speed up
                this.jumpVelocity[i] = -this.jumpSpeed; // speed to use when you start falling
            } else {
                this.isJumping[i] = false;
                // Apply gravity normally to fall
                this.jumpVelocity[i] += this.gravity;
                player.y += this.jumpVelocity[i] * this.speedDifficulty;
        
                if (this.isOnGround(i)) {
                    // Stop falling and reset on the ground
                    player.y = this.playerInitialY[i];
                    this.jumpVelocity[i] = 0; // Reset the velocity
                }
            }
        });
    }
    
    
    

    checkCollisions() {
        this.dinos.getChildren().forEach(dino => {
            this.players.forEach((player, index) => {
                if (player.active && this.rectsOverlap(player.getBounds(), dino.getBounds())) {
                    player.setVisible(false); // Hide player on collision
                    player.setActive(false); // Disable player
                    this.checkGameOver();
                }
            });
        });
    }

    checkGameOver() {
        // Game over when all players are inactive
        if (this.players.every(player => !player.active)) {
            this.gameOver = true;
            this.displayGameOver();
        }
    }

    rectsOverlap(rectA, rectB) {
        const leniency = 0.8;
        return rectA.x < rectB.x + rectB.width * leniency &&
               rectA.x + rectA.width * leniency > rectB.x &&
               rectA.y < rectB.y + rectB.height * leniency &&
               rectA.height * leniency + rectA.y > rectB.y;
    }

    displayGameOver() {
        this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Game Over', {
            font: '60px Arial',
            fill: '#ff3399'
        }).setOrigin(0.5, 0.5);
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}