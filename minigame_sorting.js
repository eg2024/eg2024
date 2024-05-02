import { Scene } from "phaser";

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

        // Areas to drop items.
        // https://labs.phaser.io/view.html?src=src/input/zones/sprite%20drop%20zone.js
        this.zones = [];
        const zones = this.zones;
        const zone_objects = [
            ["snatch_bad0", "snatch_bad1",],
            ["snatch_bad2",],
            ["snatch_good0", "snatch_good0"],
        ];
        let y = height - 100 - 5;
        zones.push(this.add.image(5, y, "sorting_wardrobe"));
        zones.push(this.add.image(10+100, y, "sorting_wardrobe"));
        zones.push(this.add.image(15+200, y, "sorting_freezerbox"));
        for (let i=0; i!=zones.length; i++) {
            zones[i].zone_index = i;
            zones[i].setInteractive({dropZone: true});
            zones[i].setOrigin(0, 0);
        }

        // Item to sort.
        const item = this.add.sprite(0, 0, "snatch_good0");
        item.setInteractive({
            draggable: true,
            pixelPerfect: true,
        });

        const reset_item = () => {
            item.x = width/2;
            item.y = height/2;
            item.zone_index = Math.floor(Math.random() * zones.length);
            const tex_idx = Math.floor(Math.random() * zone_objects[item.zone_index].length);
            item.setTexture(zone_objects[item.zone_index][tex_idx]);
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
            }
            reset_item();
            zone.clearTint();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    }
}
