import { Scene,  } from "phaser";


const RED = 0x80000, BLUE = 0x746598, GREY = 0x808080, BLACK = 0x000000;
const GOOD = 0x4caf4d, BAD = 0xef4337;

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
        record.push([x, x+data[i][0], BLUE]);
        x += data[i][1];
    }
    return record;
}

function isUp(record, t) {
    for (let i=0; i<record.length; i++)
        if (t >= record[i][0] && t <= record[i][1])
            return true;
    return false;
}

function matchBeat(record, beat) {
    // Note: allow beats to match more than once.
    const [x1, x2, b_color] = beat;
    const delta = 0.1;  // Tolerance
    for (let i=0; i<record.length; i++) {
        let [a1, a2, color] = record[i];
        if ((Math.abs(a1-x1) < delta) && (Math.abs(a2-x2) < delta)) {
            return true;
        }
    }
    return false;
}



export class Game extends Scene
{
    constructor() {
        super("gym");
    }

    init(data) {
        this.data = data;
    }

    clock2music(ms) {
        return (ms / this.timer.delay) * 10;
    }

    makeTarget() {
        this.target = makeRecord(TARGETS[this.target_idx % TARGETS.length]);
    }

    create() {
        window.scene = this;

        // Set background
        //this.cameras.main.setBackgroundColor(0xf6a46a);
        this.cameras.main.setBackgroundColor(0x675947);

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.add.image(0, -80, "gym_background").setOrigin(0, 0);

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

        this.player = this.add.sprite(width*3/4, height*3.5/5, "gym_player_down");
        this.buddy = this.add.sprite(width*1/4, height*3.5/5, "gym_buddy_down");


        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);

        // Add score text.
        let score = 0;
        let text = this.add.text(
            width/2, 40,
            "" + score, {
            font: "60px Lato",
            fill: "#440080",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);


        this.input.on("pointerdown", function (pointer) {
            this.player.setTexture("gym_player_up");
            this.record.push([this.clock2music(this.timer.elapsed), 0, GREY]);
        }, this);

        this.input.on("pointerup", function (pointer) {
            this.player.setTexture("gym_player_down");
            if(this.record.length) {
                let beat = this.record[this.record.length-1];
                beat[1] = Math.max(beat[0]+0.25, this.clock2music(this.timer.elapsed));
                if (matchBeat(this.target, beat)) {
                    beat[2] = GOOD;
                    score += 1;
                    text.setText("" + score);
                } else {
                    beat[2] = BAD;
                }
            }
        }, this);

        // Add bar
        this.graphics = this.add.graphics();

        this.intro();
    }

    update() {
        let y = 540;
        let graphics = this.graphics;
        graphics.clear();

        const width = this.game.config.width;
        const height = this.game.config.height;
        const max_t = this.clock2music(this.timer.delay);
        const t = this.clock2music(this.timer.elapsed);
        const r = 10;


        graphics.fillStyle(BLACK);

        // H-lines
        graphics.fillRect(0, y+0*r, width, 2);
        graphics.fillRect(0, y+4*r, width, 2);
        graphics.fillRect(0, y+8*r, width, 2);

        // V-lines
        graphics.fillRect(0, y, 2, 8*r);
        graphics.fillRect(width-2, y, 2, 8*r);
        graphics.fillStyle(BLACK, 0.2);
        for (let i=1; i<max_t; i++) {
            graphics.fillRect(i/max_t * width, y, 2, 8*r);
        }
        graphics.fillStyle(RED, 1.0);
        graphics.fillRect(t/max_t * width, y, 2, 8*r);

        this.drawRecord(graphics, this.target, y+2*r, t, max_t, width, r);
        this.drawRecord(graphics, this.record, y+6*r, t, max_t, width, r);

        if (isUp(this.target, t)) {
            this.buddy.setTexture("gym_buddy_up");
        } else {
            this.buddy.setTexture("gym_buddy_down"); 
        }
    }

    drawRecord(graphics, record, y, t, max_t, width, r) {
        for (let i=0; i!=record.length; i++) {
            let [x1, x2, color] = record[i];
            if(x2 == 0) { x2 = t; }
            x1 = x1/max_t * width;
            x2 = x2/max_t * width;

            graphics.fillStyle(color);
            graphics.fillEllipse(x1, y, 4, 2*r);
            graphics.fillRect(x1, y-r, x2-x1, 2*r);
            graphics.fillEllipse(x2, y, 4, 2*r);
        }
    }

    intro() {
        if (!this.data["restart"]) {
            this.scene.launch("intro", {
                "minigame": this,
                "text": "Every monday after work Erik goes to the Gym at Google.\n\nHelp him keep the pace with his friend Karolis.",
            });
            this.scene.pause();
        }
    }

    gameover() {
        this.scene.launch("gameover", {
            "minigame": this,
            "text": "You helped Erik lifting " + this.score + " times.",
        });
        this.scene.pause();
    }
}
