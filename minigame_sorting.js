import { Scene } from "phaser";

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

export class Game extends Scene
{
    constructor() {
        super("sorting");
    }

    create() {
        window.scene = this;

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.cameras.main.setBackgroundColor(0xffffff);

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);

        // Add score text.
        let score = 0;
        let text = this.add.text(
            width/2, 60,
            "" + score, {
            font: "65px Arial",
            fill: "#440080",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);

        // Add times.
        this.timer = this.time.addEvent({ delay: 30*1000 });
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
            ["snatch_bad0", "snatch_bad1",],
            ["snatch_bad2",],
            ["snatch_good0", "snatch_good0"],
        ];
        zones.push(this.add.image(0, 0, "sorting_wardrobe"));
        zones.push(this.add.image(0, 0, "sorting_wardrobe"));
        zones.push(this.add.image(0, 0, "sorting_freezerbox"));

        let y = height - 100 - 5;
        let x = [5, 10+100, 15+200];
        shuffleArray(x);
        for (let i=0; i!=zones.length; i++) {
            zones[i].x = x[i];
            zones[i].y = y;
            zones[i].zone_index = i;
            zones[i].setInteractive({dropZone: true});
            zones[i].setOrigin(0, 0);
        }

        // Item to sort.
        this.item = this.add.sprite(0, 0, "snatch_good0");
        const item = this.item;
        item.setInteractive({draggable: true});

        const reset_item = () => {
            if (this.timer.getRemainingSeconds() > 0) {
                item.sx = width/4 + 2*width/4*Math.random();
                item.sy = height/2;
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
                zone.setTint(0x00ff00);
            } else {
                zone.setTint(0xff0000);
            }
        });

        this.input.on('dragleave', (pointer, gameObject, zone) => {
            zone.clearTint();
        });

        this.input.on('drop', (pointer, gameObject, zone) => {
            if (gameObject.zone_index == zone.zone_index) {
                score += 1;
                text.setText("" + score);
                reset_item();
            } else {
                item.x = item.sx;
                item.y = item.sy;
            }
            zone.clearTint();
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
    }

    update() {
        this.timer_text.text = this.timer.getRemainingSeconds().toFixed(1) + "s";
    }
}
