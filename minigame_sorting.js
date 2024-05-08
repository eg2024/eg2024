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

        //this.cameras.main.setBackgroundColor(0xd1e3cf);
        this.cameras.main.setBackgroundColor(0x9dc89a);
        const y_off = 75;
        const bg = this.add.image(0, y_off, "sorting_background").setOrigin(0, 0).setAlpha(0.5);
        const hearts = this.add.image(0, y_off, "sorting_hearts").setOrigin(0, 0).setAlpha(0.0);


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
            "", {
            font: "60px Arial",
            fill: "#440080",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);

        // Add times.
        this.timer = this.time.addEvent({
            delay: 5*60*1000,
            callback: () => { this.gameover(); },
        });
        this.timer_text = this.add.text(
            width/6, 60, "filled in update", {
            font: "20px Arial",
            fill: "#440080",
            align: "center"
        });
        this.timer_text.setOrigin(0.5, 0.5);
        this.update();

        // Areas to drop items.
        // https://labs.phaser.io/view.html?src=src/input/zones/sprite%20drop%20zone.js
        this.zones = [];
        const zones = this.zones;
        const zone_objects = [
            [
                "sorting_gift0", "sorting_gift1", "sorting_gift2", "sorting_gift3", "sorting_gift4",
                "sorting_gift0", "sorting_gift1", "sorting_gift2", "sorting_gift3", "sorting_gift4",
                "sorting_gift0", "sorting_gift1", "sorting_gift2", "sorting_gift3", "sorting_gift4",
            ],
            [
                "sorting_carp", "sorting_chicken", "sorting_carp", "sorting_chicken",
                "sorting_meat0", "sorting_meat1", "sorting_meat2", "sorting_meat3", "sorting_meat4", "sorting_meat5", "sorting_meat6", "sorting_meat7", "sorting_meat0",
            ],
            [
                "sorting_jar0", "sorting_jar1", "sorting_jar2", "sorting_jar3",
                "sorting_jar0", "sorting_jar1", "sorting_jar2", "sorting_jar3",
                "sorting_jar0", "sorting_jar1", "sorting_jar2", "sorting_jar3",
            ],
        ];
        zones.push(this.add.image(0, y_off, "sorting_klara"));
        zones.push(this.add.image(0, y_off, "sorting_fridge"));
        zones.push(this.add.image(0, y_off, "sorting_cupboard"));


        for (let i=0; i!=zones.length; i++) {
            zones[i].zone_index = i;
            zones[i].setInteractive({dropZone: true, pixelPerfect: true});
            zones[i].setOrigin(0, 0);
        }

        let all_items = [];
        for (let i=0; i!=zone_objects.length; i++) {
            for (let j=0; j!=zone_objects[i].length; j++) {
                all_items.push([zone_objects[i][j], i]);
            }
        }
        shuffleArray(all_items);
        this.num_objects = all_items.length;

        // Item to sort.
        this.item = this.add.sprite(0, 0, "");
        const item = this.item;
        item.setInteractive({draggable: true});

        const reset_item = () => {
            text.text = this.score + "/" + this.num_objects;
            if (all_items.length) {
                //item.sx = width/4 + 2*width/4*Math.random();
                item.sx = 180;
                item.sy = 250;
                item.x = item.sx;
                item.y = item.sy;
                item.setOrigin(0.5, 0.5);
                let [it_tex, it_zone] = all_items.pop();
                item.setTexture(it_tex);
                item.zone_index = it_zone;
            } else {
                item.setAlpha(0.0);
                this.gameover();
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
        this.timer_text.text = this.timer.getElapsedSeconds().toFixed(1) + "s";
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
        let text = "Gabriela thanks you. This was much easier with your help.\n\nYou sorted " + this.score + " items in " + this.timer.getElapsedSeconds().toFixed(1) + "s.";
        this.scene.launch("gameover", {
            "minigame": this,
            "text": text,
        });
        this.scene.pause();
    }
}


function shuffleArray(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}
