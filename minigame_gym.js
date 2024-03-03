import { Scene,  } from "phaser";


const TARGETS = [
    [[0, 2.0],
     [0.25, 1.0], [0.25, 1.0],
     [0.25, 1.0], [0.25, 1.0],
     [1.00, 2.0], [1.00, 2.0],
    ],
    [[0, 2.0],
     [0.25, 0.5], [0.25, 1.0],
     [0.25, 0.5], [0.25, 1.0],
     [0.25, 0.5], [1.00, 1.5],
     [0.25, 0.5], [1.00, 1.5],
    ],
    [[0, 2.0],
     [0.25, 0.5], [0.25, 0.5], [0.50, 1.0],
     [0.25, 0.5], [0.25, 0.5], [0.50, 1.0],
     [0.25, 0.5], [0.25, 0.5], [0.50, 1.0],
     [0.25, 0.5], [0.25, 0.5], [0.50, 1.0],
    ],
];


function makeRecord(data) {
    let record = [];
    let x = data[0][1];
    for (let i=1; i<data.length; i++) {
        record.push([x, x+data[i][0]]);
        x += data[i][1];
    }
    return record;
}



export class Game extends Scene
{
    constructor() {
        super("gym");
    }

    clock2music(ms) {
        return (ms / this.timer.delay) * 10;
    }

    makeTarget() {
        this.target = makeRecord(TARGETS[this.target_idx % TARGETS.length]);
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        this.record = [];
        this.target_idx = 0;
        this.makeTarget();
        this.timer = this.time.addEvent({
            "delay": 8000*60/72, "loop": true,
            "callback": () => {
                this.target_idx += 1;
                this.makeTarget();
                this.record = [];
            },
        });

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);

        // Add score text.
        let score = 0;
        let text = this.add.text(
            width/2, 40,
            "" + score, {
            font: "65px Arial",
            fill: "#ff0044",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);


        // Add erik
        let erik = this.add.sprite(width/2, height/2, "gym_erik_down");
        erik.setInteractive();
        erik.on("pointerdown", function (pointer) {
            erik.setTexture("gym_erik_up");

            this.record.push([this.clock2music(this.timer.elapsed), 0]);
            score += 1;
            text.setText("" + score);
        }, this);

        erik.on("pointerup", function (pointer) {
            erik.setTexture("gym_erik_down");

            if(this.record.length) {
                this.record[this.record.length-1][1] = this.clock2music(this.timer.elapsed);
            }
        }, this);

        // Add bar
        this.graphics = this.add.graphics();

    }

    update(time, delta) {
        let y = 100;
        let graphics = this.graphics;
        graphics.clear();

        const width = this.game.config.width;
        const height = this.game.config.height;
        const max_t = this.clock2music(this.timer.delay);
        const t = this.clock2music(this.timer.elapsed);
        const r = 10;
        const red = 0x880000, black = 0x000000;


        graphics.fillStyle(red);
        this.drawRecord(graphics, this.target, y+2*r, t, max_t, width, r);
        this.drawRecord(graphics, this.record, y+6*r, t, max_t, width, r);

        graphics.fillStyle(black);

        // H-lines
        graphics.fillRect(0, y+0*r, width, 2);
        graphics.fillRect(0, y+4*r, width, 2);
        graphics.fillRect(0, y+8*r, width, 2);

        // V-lines
        graphics.fillRect(0, y, 2, 8*r);
        graphics.fillRect(width-2, y, 2, 8*r);
        graphics.fillStyle(black, 0.2);
        for (let i = 1; i<max_t; i++) {
            graphics.fillRect(i/max_t * width, y, 2, 8*r);
        }

        graphics.fillStyle(red, 1.0);
        graphics.fillRect(t/max_t * width, y, 2, 8*r);
    }

    drawRecord(graphics, record, y, t, max_t, width, r) {
        for (let i=0; i!=record.length; i++) {
            let [x1, x2] = record[i];
            if(x2 == 0) { x2 = t; }
            x1 = x1/max_t * width;
            x2 = x2/max_t * width;

            graphics.fillEllipse(x1, y, 4, 2*r);
            graphics.fillRect(x1, y-r, x2-x1, 2*r);
            graphics.fillEllipse(x2, y, 4, 2*r);
        }

    }
}
