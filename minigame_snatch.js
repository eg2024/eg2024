import { Scene } from "phaser";

export class Game extends Scene
{
    constructor() {
        super("snatch");
    }

    init(data) {
        this.data = data;
    }

    create() {
        window.scene = this;

        // Check examples in https://labs.phaser.io/
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) {
            this.scene.start("menu");
            this.scene.stop();
        }, this);

        // Add text in center.
        this.bad = 0;
        this.score = 0;
        this.text = this.add.text(width*0.5, 40, "" + this.score, {
            font: "65px Arial",
            fill: "#ff0044",
            align: "center",
        });
        this.text.setOrigin(0.5, 0.5);

        this.lives = []
        for (let n=0; n!=3; n++) {
            let item = this.add.sprite(0, 0, "heart_full");
            item.x = 0.1*width + 20*(3-n-1);
            item.y = 40;
            this.lives.push(item);
        }
        
        this.items = [];
        for (let n=0; n!=3; n++) {
            let item = this.add.sprite(0, 0, "snatch_good0");
            item.setInteractive();
            item.on('pointerdown',  pointer => this.clickItem(item));
            this.resetItem(item);
            this.items.push(item);
        }

        this.intro();
    }

    clickItem(item) {
        this.resetItem(item);
    }

    dropItem(item) {
        if (item.good) {
            this.score += 1;
            this.text.setText("" + this.score);
        } else {
            if (this.bad < this.lives.length) {
                this.lives[this.bad].setTexture("heart_empty");
                this.bad += 1;
            }
        }
        if (this.bad >= this.lives.length) {
            this.gameover();
        } else {
            this.resetItem(item);
        }
    }

    resetItem(item) {

        const width = this.game.config.width;
        const height = this.game.config.height;

        let x = (Math.random()*8/10 + 1/10)*width;
        let y = (Math.random()*1/8 + 1/10)*height;
        item.good = Math.random() > 0.5;
        item.sx = x;
        item.sy = y;
        item.sd = 0;
        item.speed = (this.score + 20) * 10;

        item.x = x;
        item.y = y;
        
        if (item.good) {
           item.setTexture("snatch_good" + Math.floor(Math.random() * 2));
        } else {
            item.setTexture("snatch_bad" + Math.floor(Math.random() * 3));
        }
    }

    update(time, delta) {
        if (this.bad >= this.lives.length)
            return;

        const width = this.game.config.width;
        const height = this.game.config.height;
        for (let n=0; n!=3; n++) {
            let item = this.items[n];
            item.sd += delta/1000.0;
            item.y = item.sy + item.sd * item.speed;
            if (item.y > height) this.dropItem(item);
        }
    }

    intro() {
        if (!this.data["restart"]) {
            this.scene.launch("intro", {
                "minigame": this,
                "text": "Taking care of kids is no easy task.\n\nLet them play with good items. Remove the bad ones.",
            });
            this.scene.pause();
        }
    }

    gameover() {
        this.scene.launch("gameover", {
            "minigame": this,
            "text": "You let the kids plays with " + this.score + " items.",
        });
        this.scene.pause();
    }
}
