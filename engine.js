const canvas = document.querySelector ('canvas')
const ctx    = canvas.getContext ('2d')

ctx.imageSmoothingEnabled = false

canvas.width  = 1024
canvas.height = 576

const input = {
    key : {
        UP    : false,
        DOWN  : false,
        LEFT  : false,
        RIGHT : false,
        BTN_A : false,
        BTN_B : false,
        BTN_X : false,
        BTN_Y : false,
        START : false,
    },

    kbListener : (e) => {
        let state = (e.type === 'keydown')
        inputParser (e.key, state)
    },

    touchListener : (e) => {
        e.preventDefault();

        let state = e.type === 'touchstart';
        let button = null;

        if (e.target.tagName.toLowerCase() === 'button') {
            button = e.target;
            inputParser (button.getAttribute ('data-value'), state)
        }

    },

    handler : null,
}


function inputParser (handle, state) {
    switch (handle) {
        case 'ArrowUp' :
            input.key.UP = state
            break;
        case 'ArrowDown' :
            input.key.DOWN = state
            break;
        case 'ArrowLeft' :
            input.key.LEFT = state
            break;
        case 'ArrowRight' :
            input.key.RIGHT = state
            break;

        case 'x' :
            input.key.BTN_B = state
            break;
        case 'c' :
            input.key.BTN_A = state
            break;
        case 's' :
            input.key.BTN_Y = state
            break;
        case 'd' :
            input.key.BTN_X = state
            break;

        case 'Enter' :
            input.key.START = state
            break;
    }
}

document.addEventListener ('keydown',    input.kbListener)
document.addEventListener ('keyup',      input.kbListener)
document.addEventListener ('touchstart', input.touchListener, {'passive' : false})
document.addEventListener ('touchend',   input.touchListener)

const direction = {
    UP    : 0,
    DOWN  : 1,
    LEFT  : 2,
    RIGHT : 3,
}

class Obj {
    constructor ({pos, width, height, color }) {
        this.pos = pos
        this.width = width
        this.height = height
        this.color = color
    }

    draw () {
        ctx.save ()
        ctx.fillStyle = this.color
        ctx.fillRect (this.pos.x, this.pos.y, this.width, this.height)
        ctx.restore ()
    }
}

class Sprite extends Obj {
    constructor ({pos, width, height, color, direction }) {
        super ({pos, width, height, color });
        this.vel = {
            x : 0,
            y : 0,
        }
        this.direction = direction
    }

    move () {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
    }
}

class Shot extends Sprite {
    constructor ({pos, width, height, color, direction }) {
        super ({pos, width, height, color, direction });
    }

    move () {
        let vel = 15

        switch (this.direction) {
            case direction.UP :
                this.vel.x = 0
                this.vel.y = -vel
                break;
            case direction.DOWN :
                this.vel.x = 0
                this.vel.y = vel
                break;
            case direction.LEFT :
                this.vel.x = -vel
                this.vel.y = 0
                break;
            case direction.RIGHT :
                this.vel.x = vel
                this.vel.y = 0
                break;
        }

        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
    }

    remove () {
        shotList.splice (shotList.indexOf (this), 1)
        return ;
    }

    checkBorder () {
        if (
            this.pos.x > canvas.width && this.direction === direction.RIGHT ||
            this.pos.x + this.width < 0 && this.direction === direction.LEFT ||
            this.pos.y > canvas.height && this.direction === direction.DOWN ||
            this.pos.y + this.height < 0 && this.direction === direction.UP
        ) {
            this.remove ()
        }
    }

    update () {
        this.move ();
        this.checkBorder ();
        this.draw ();
    }
}

class Player extends Sprite {
    constructor ({pos, width, height, color, direction }) {
        super ({pos, width, height, color, direction });
        this.buffer = 0
    }

    /**
    * @Override
    */
    draw () {
        ctx.save ()
        ctx.fillStyle = this.color
        ctx.fillRect (this.pos.x, this.pos.y, this.width, this.height)
        ctx.fillStyle = 'black'
        ctx.font = '16px Arial'

        let x = this.pos.x + this.width / 2 - 4
        let y = this.pos.y + this.height / 2 + 4
        let arrow = ''

        switch (this.direction) {
            case direction.UP :
                arrow = '↑'
                break
            case direction.DOWN :
                arrow = '↓'
                break
            case direction.LEFT :
                arrow = '←'
                break
            case direction.RIGHT :
                arrow = '→'
                break
        }
        ctx.fillText (arrow, x, y)

        ctx.restore ()

    }

    shoot (direction) {
        if (shotList.length > shotLimit - 1) return;

        shotList.push (
            new Shot ({
                pos : {
                    x : this.pos.x + this.width / 2 - 4,
                    y : this.pos.y + this.height / 2 - 4
                },
                width     : 8,
                height    : 8,
                color     : 'lime',
                direction : direction,
            })
        )
    }
}

const shotList = []
const shotLimit = 5

const player = new Player ({
    pos : {
        x: 300,
        y: 451,
    },
    width     : 32,
    height    : 32,
    color     : 'red',
    direction : direction.UP
})

var move = 5

const shooting = {
    UP    : false,
    DOWN  : false,
    LEFT  : false,
    RIGHT : false,
}

var isShooting = false

function handlePlayerMultiShotDirection () {

    if (input.key.UP) {
        player.vel.y = -move
        player.direction = direction.UP
    } else if (input.key.DOWN) {
        player.vel.y = move
        player.direction = direction.DOWN
    } else {
        player.vel.y = 0
    }

    if (input.key.LEFT) {
        player.vel.x = -move
        player.direction = direction.LEFT
    } else if (input.key.RIGHT) {
        player.vel.x = move
        player.direction = direction.RIGHT
    } else {
        player.vel.x = 0
    }

    if (input.key.BTN_B) {
        if (shooting.DOWN == false) {
            shooting.DOWN = true;
            player.shoot (direction.DOWN)
        }
    } else {
        shooting.DOWN = false;
    }

    if (input.key.BTN_Y) {
        if (shooting.LEFT == false) {
            shooting.LEFT = true;
            player.shoot (direction.LEFT)
        }
    } else {
        shooting.LEFT = false;
    }

    if (input.key.BTN_A) {
        if (shooting.RIGHT == false) {
            shooting.RIGHT = true;
            player.shoot (direction.RIGHT)
        }
    } else {
        shooting.RIGHT = false;
    }

    if (input.key.BTN_X) {
        if (shooting.UP == false) {
            shooting.UP = true;
            player.shoot (direction.UP)
        }
    } else {
        shooting.UP = false;
    }

    if (input.key.START) {
        console.log ('start')
    }
}


function handlePlayer () {

    for (key in input.key) {
        if (input.key[key]) {
            navigator.vibrate (10)
        }
    }

    if (input.key.UP) {
        player.vel.y = -move
        player.direction = direction.UP
    } else if (input.key.DOWN) {
        player.vel.y = move
        player.direction = direction.DOWN
    } else {
        player.vel.y = 0
    }

    if (input.key.LEFT) {
        player.vel.x = -move
        player.direction = direction.LEFT
    } else if (input.key.RIGHT) {
        player.vel.x = move
        player.direction = direction.RIGHT
    } else {
        player.vel.x = 0
    }

    if (input.key.BTN_B) {
        if (isShooting == false) {
            isShooting = true;
            player.shoot (player.direction)
        }
    } else {
        isShooting = false;
    }

    if (input.key.START) {
        input.key.START = false;
        console.log ('start')
    }
}

input.handler = handlePlayer

function gunMeter () {
    let percent = (shotList.length / shotLimit) * 100;
    /*caixa fundo*/
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect (12, 12, 10, 102)
    /*caixa sombra*/
    ctx.strokeStyle = '#000'
    ctx.strokeRect (11, 11, 14, 106)
    /*caixa borda*/
    ctx.lineWidth = 2
    ctx.strokeStyle = '#fff'
    ctx.strokeRect (10, 10, 14, 106)


    /*medidor*/
    ctx.fillStyle = `rgba(255, ${255 - (2.5 * percent)} , 0,1)`
    ctx.fillRect (13, 13 + percent, 8, 100 - percent )
}

function main () {
    requestAnimationFrame (main);
    ctx.clearRect (0, 0, canvas.width, canvas.height)

    player.move ()
    player.draw ();

    shotList.forEach (shot => {
        shot.update ()
    })

    gunMeter ();
    input.handler ();
}

main ()
