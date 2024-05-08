import { Scene } from "phaser";


export class Game extends Scene
{
    constructor() {
        super("sorting");
    }

    init(data) {
        this.data = data;
    }

    create() {
        window.scene = this;

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.cameras.main.setBackgroundColor(0xd1e3cf);
        const bg = this.add.image(0, 0, "sorting_background").setOrigin(0, 0).setAlpha(0.5);
        const hearts = this.add.image(0, 0, "sorting_hearts").setOrigin(0, 0).setAlpha(0.0);


        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) {
            this.scene.start("menu");
            this.scene.stop();
        }, this);

        // Add score text.
        this.score = 0;
        let text = this.add.text(
            width/2, 60,
            "" + this.score, {
            font: "65px Arial",
            fill: "#440080",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);

        // Add times.
        this.timer = this.time.addEvent({
            delay: 30*1000,
            callback: () => { this.gameover(); },
        });
        this.timer_text = this.add.text(
            width/5, 60,
            this.timer.getRemainingSeconds().toFixed(1), {
            font: "30px Arial",
            fill: "#440080",
            align: "center"
        });
        this.timer_text.setOrigin(0.5, 0.5);

        // Areas to drop items.
        // https://labs.phaser.io/view.html?src=src/input/zones/sprite%20drop%20zone.js
        this.zones = [];
        const zones = this.zones;
        const zone_objects = [
            ["sorting_gift0", "sorting_gift1", "sorting_gift2", "sorting_gift3", "sorting_gift4",],
            ["sorting_carp", "sorting_chicken", "sorting_meat0", "sorting_meat1", "sorting_meat2", "sorting_meat3", "sorting_meat4", "sorting_meat5", "sorting_meat6", "sorting_meat7", "sorting_meat0"],
            ["sorting_jar0", "sorting_jar1", "sorting_jar2", "sorting_jar3"],
        ];
        zones.push(this.add.image(0, 0, "sorting_klara"));
        zones.push(this.add.image(0, 0, "sorting_fridge"));
        zones.push(this.add.image(0, 0, "sorting_cupboard"));

        for (let i=0; i!=zones.length; i++) {
            zones[i].zone_index = i;
            zones[i].setInteractive({dropZone: true, pixelPerfect: true});
            zones[i].setOrigin(0, 0);
        }

        // Item to sort.
        this.item = this.add.sprite(0, 0, "snatch_good0");
        const item = this.item;
        item.setInteractive({draggable: true});

        const reset_item = () => {
            if (this.timer.getRemainingSeconds() > 0) {
                item.sx = width/4 + 2*width/4*Math.random();
                item.sy = height*7/8;
                item.x = item.sx;
                item.y = item.sy;
                item.zone_index = Math.floor(Math.random() * zones.length);
                const tex_idx = Math.floor(Math.random() * zone_objects[item.zone_index].length);
                item.setTexture(zone_objects[item.zone_index][tex_idx]);
            } else {
                item.input.enabled = false;
            }
        };

        reset_item();

        // Handle input.
        this.input.on('dragenter', (pointer, gameObject, zone) => {
            if (gameObject.zone_index == zone.zone_index) {
                if (gameObject.zone_index == 0) {
                    hearts.setAlpha(1.0);
                }
                else {
                    zone.setTint(0x88ff88);
                }
            } else {
                zone.setTint(0xff8888);
                hearts.setAlpha(0.0);
            }
        });

        this.input.on('dragleave', (pointer, gameObject, zone) => {
            zone.clearTint();
            hearts.setAlpha(0.0);
        });

        this.input.on('drop', (pointer, gameObject, zone) => {
            if (gameObject.zone_index == zone.zone_index) {
                this.score += 1;
                text.setText("" + this.score);
                reset_item();
            } else {
                item.x = item.sx;
                item.y = item.sy;
            }
            zone.clearTint();
            hearts.setAlpha(0.0);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        item.on('dragend', function(pointer, dragX, dragY, dropped){
            if (!dropped) {
                item.x = item.sx;
                item.y = item.sy;
            }
        });

        this.intro();
    }

    update() {
        this.timer_text.text = this.timer.getRemainingSeconds().toFixed(1) + "s";
    }

    intro() {
        if (!this.data["restart"]) {
            this.scene.launch("intro", {
                "minigame": this,
                "text": "Every two weeks the Czech family comes to visit with a full car...\n\nHelp Gabriela sort the items.",
            });
            this.scene.pause();
        }
    }

    gameover() {
        this.scene.launch("gameover", {
            "minigame": this,
            "text": "You helped Gabca sort " + this.score + " items.",
        });
        this.scene.pause();
    }
}
