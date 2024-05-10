import { Scene,  } from "phaser";


const BPM = 90;
const RED = 0x80000, BLUE = 0x746598, GREY = 0x808080, BLACK = 0x000000, WHITE = 0xffffff;
const GOOD = 0x4caf4d, BAD = 0xef4337;

const LEVELS = [
    [[0.0, 2.0], [1.0, 2.0], [1.0, 2.0], [1.0, 2.0], [0.0, 0.0],],
    //[[0.0, 2.0], [1.0, 2.0], [1.0, 2.0], [1.0, 2.0], [0.0, 0.0],],
    [[0.0, 2.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.0, 0.0],],
    //[[0.0, 2.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.5, 1.0], [0.0, 0.0],],
    [[0.0, 2.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.0, 0.0],],
    //[[0.0, 2.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.25, 0.5], [0.25, 0.5], [0.50, 1.0], [0.0, 0.0],],
];

// Example: morse('AAS') = '.- .- ...'
function morse(s) {
    const morseCode = {
        'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
        'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
        'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
        'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
        'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
        'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
        'Y': '-.--',  'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.'
    };

    return s.toUpperCase().split('').map(char => morseCode[char] || '').join(' ');
}

function morseToLevel(string) {
    let s = morse(string);

    let shortbeat = 0.25; // dot
    let longbeat = 0.5; // dash
    let shortbreak = 0.25; // between dots and dashes in a single letter
    let longbreak = 0.5; // between letters in a single word

    let level = [];
    let t = 1.5; // the time
    level.push([0.0,t]); // new bar which starts after delay 2
    for (let letter of s.split(' ')) {
        for (let i = 0; i < letter.length; i++) {
            let symbol = letter[i];
            let breaktime = (i == letter.length-1? longbreak : shortbreak);
            let beatttime = symbol == '.'? shortbeat : longbeat;
            level.push([beatttime,beatttime+breaktime]);

            t += beatttime+breaktime; // time
        }
    }

    t -= longbreak; // don't count he last break

    if (t > 8)
        console.log(["WARNING music for morse code too long", string, t]); // This must be <= 8

    // Adjust last delay so the whole thing has length 8
    let remainder = 8-t;
    level[level.length-1][1] = level[level.length-1][0] + remainder;

    level.push([0.0,0.0]); // end level

    return level;
}

const MORSE_WORDS = ["ERIK", "AAS", "24", "GAB", "NOB", "YES", "KLA", "GG", "WP", "QT"];

function getRandomChoice(items) {
    // Generate a random index based on the length of the items array
    const randomIndex = Math.floor(Math.random() * items.length);
    // Return the item at the random index
    return items[randomIndex];
}


function makeRecord(data) {
    let record = [];
    let x = data[0][1];
    for (let i=1; i<data.length; i++) {
        record.push([x, x+data[i][0], WHITE]);
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
    const delta = 0.15;  // Tolerance
    for (let i=0; i<record.length; i++) {
        let [a1, a2, color] = record[i];
        let s_off = Math.abs(a1-x1);
        let d_off = Math.abs((a2-a1) - (x2-x1));
        // It is hard to be on time when screen lags on phones, be more tolerant
        // with start but less with duration.
        if (s_off < 0.2 && d_off < 0.15)
            return true;
        //if ((Math.abs(a1-x1) < delta) && (Math.abs(a2-x2) < delta)) {
        //    return true;
        //}
    }
    return false;
}

function countBeats(record) {
    let num_beats = 0;
    for (let i=0; i!=record.length; i++) {
        let [x1, x2, color] = record[i];
        if (x1 != x2) num_beats += 1;
    }
    return num_beats;
}

function music2clock(x) {
    return x*60*1000/BPM;  // ms
}

function clock2music(ms) {
    return ms*BPM/1000/60;
}


export class Game extends Scene
{
    constructor() {
        super("gym");
    }

    init(data) {
        this.data = data;
        this.levels = [];

        for (let i=0; i!=LEVELS.length; i++) {
            this.levels.push(LEVELS[i]);
        }

        for (let i=0; i!=7; i++) {
            let lvl = [];
            for (let beat of morseToLevel(getRandomChoice(MORSE_WORDS)))
                lvl.push(beat);
            this.levels.push(lvl);
        }
    }

    setupLevel() {
        this.target = makeRecord(this.levels[this.level % this.levels.length]);
        let track_len = this.target[this.target.length - 1][1];
        this.timer.delay = music2clock(track_len);
        this.num_beats = countBeats(this.target);
        this.record = [];
        this.score = 0;
        this.updateScore();
    }

    timeOver() {
        if (this.num_beats != this.score) {
            return this.gameover();
        }
        if (this.level+1 == this.levels.length) {
            return this.gameover();
        }

        this.level += 1;
        this.setupLevel();
    }

    updateScore() {
        this.lvl_text.setText("Lvl " + (this.level + 1));
        this.text.setText("" + this.score + "/" + this.num_beats);

    }

    create() {
        window.scene = this;

        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        //this.cameras.main.setBackgroundColor(0xf6a46a);
        this.cameras.main.setBackgroundColor(0x675947);
        this.add.image(0, -60, "gym_background").setOrigin(0, 0);

        /*
        // Draw white rectangle at top for color consistency with main menu?
        this.rectangleGraphics = this.add.graphics();
        this.rectangleGraphics.fillStyle(WHITE, 1);  // Set the color and alpha of the rectangle
        this.rectangleGraphics.fillRect(0, 0, width, 80);  // Draw the rectangle at position (0,0) with full width and 30px height
        */

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) {
            this.scene.start("menu");
            this.scene.stop();
        }, this);
        this.back = back;

        // Add score text.
        this.text = this.add.text(
            width/2, 40,
            "", {
            font: "60px Arial",
            fill: "#440080",
            align: "center"
        }).setOrigin(0.5, 0.5);

        this.lvl_text = this.add.text(
            width/6, 40, "", {
            font: "20px Arial",
            fill: "#440080",
            align: "center"
        }).setOrigin(0.5, 0.5);

        // Add characters.
        this.player = this.add.sprite(width*3/4, height*3.3/5, "gym_player_down");
        this.buddy = this.add.sprite(width*1/4, height*3.3/5, "gym_buddy_down");

        // Add bar
        this.graphics = this.add.graphics();

        // Timer
        this.timer = this.time.addEvent({
            "delay": 8000*60/72, "loop": true,
            "callback": () => { this.timeOver(); },
        });


        // Handle input.
        this.input.on("pointerdown", function (pointer) {
            this.player.setTexture("gym_player_up");
            this.record.push([clock2music(this.timer.elapsed), 0, GREY]);
        }, this);

        this.input.on("pointerup", function (pointer) {
            this.player.setTexture("gym_player_down");
            if(this.record.length) {
                let beat = this.record[this.record.length-1];
                beat[1] = Math.max(beat[0]+0.25, clock2music(this.timer.elapsed));
                if (matchBeat(this.target, beat)) {
                    beat[2] = GOOD;
                    this.score += 1;
                    this.total_score += 1;
                    this.updateScore();
                } else {
                    beat[2] = BAD;
                }
            }
        }, this);

        this.level = 0;
        this.total_score = 0;
        this.setupLevel();

        this.intro();
    }

    update() {
        let y = 510;
        let graphics = this.graphics;
        graphics.clear();

        const width = this.game.config.width;
        const height = this.game.config.height;
        const t = clock2music(this.timer.elapsed);
        let min_t = 0;
        let max_t = 8;

        while (max_t <= t) {
            min_t += 8;
            max_t += 8;
        }
        const r = 10;

        function t2x(a) {
            return (a - min_t) / (max_t - min_t) * width;
        }


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
            graphics.fillRect(t2x(i), y, 2, 8*r);
        }

        this.drawRecord(graphics, this.target, y+2*r, t, t2x, r);
        this.drawRecord(graphics, this.record, y+6*r, t, t2x, r);

        graphics.fillStyle(RED, 1.0);
        graphics.fillRect(t2x(t), y, 2, 8*r);

        if (isUp(this.target, t)) {
            this.buddy.setTexture("gym_buddy_up");
        } else {
            this.buddy.setTexture("gym_buddy_down"); 
        }
    }

    drawRecord(graphics, record, y, t, t2x, r) {
        for (let i=0; i!=record.length; i++) {
            let [x1, x2, color] = record[i];
            if (x1 == x2) continue;
            if(x2 == 0) { x2 = t; }
            x1 = t2x(x1);
            x2 = t2x(x2);

            graphics.fillStyle(color);
            graphics.fillEllipse(x1, y, 4, 2*r);
            graphics.fillRect(x1, y-r, x2-x1, 2*r);
            graphics.fillEllipse(x2, y, 4, 2*r);
        }
    }


    intro() {
        let msg = "Every monday after work Erik goes to the Gym.\n\nHelp him keep pace with his gym buddy Karolis.";
        let highscore = JSON.parse(localStorage.getItem('highscore_gym')) || 0;
        if (highscore > 0)
            msg += "\n\nHighscore: " + Math.floor(highscore) + "%";

        if (!this.data["restart"]) {
            this.scene.launch("intro", {
                "minigame": this,
                "text": msg,
            });
            this.scene.pause();
        }
    }

    gameover() {
        this.back.visible = false;

        let lvl_percent = 100 / this.levels.length;
        let final_score = this.level * lvl_percent + (this.score / this.num_beats)*lvl_percent;
        let highscore = JSON.parse(localStorage.getItem('highscore_gym')) || 0;
        let newhighscore = highscore < final_score;
        highscore = Math.max(highscore, final_score);
        if (!(typeof highscore === 'number' && isFinite(highscore) && highscore > 0))
            highscore = 0;
        localStorage.setItem('highscore_gym', JSON.stringify(highscore));

        let text = "";
        if (final_score >= 100.0) {
            this.scene.launch("gameover", {
                "minigame": this,
                "image": "gym_perfect",
                "text": "You got Erik a perfect score. Samuel is proud of him.",
            });
            this.scene.pause();
            return
        }

        text = "You lost tempo on level " + (this.level+1) + " out of " + this.levels.length + ". That is " + Math.floor(final_score) + "% of the work out."

        if (newhighscore) {
            text += "\n\nNEW HIGHSCORE!";
        } else {
            text += "\n\nHighscore: " + Math.floor(highscore) + "%";
        }

        this.scene.launch("gameover", {
            "minigame": this,
            "text": text,
        });
        this.scene.pause();
    }
}
