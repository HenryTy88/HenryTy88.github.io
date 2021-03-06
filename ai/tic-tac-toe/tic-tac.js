var board = [];
var boardSize = 3;
var screen = 0;
var computer = false;
var turn;
var wait = 0;
var done = false;
var winner = null;
var players = ["X","O"]

var score = [0, 0];
var moveTimer = 0;


function MinMax(state, maxing, depth, alpha, beta) {    
    //terminal state
    if (isFull(state)) {
        return 0
    }

    if (checkWon("X", state)) {
        return -1
    }

    if (checkWon("O", state)) {
        return 1
    }

    if (maxing) {
        //o"s turn
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i in state) {
            for (let j in state[i]) {
                if (state[i][j] == "") {

                    state[i][j] = "O"
                    let possibleScore = MinMax(state, false, depth+1, alpha, beta)
                    state[i][j] = ""

                    if (possibleScore > bestScore) {
                        bestScore = possibleScore
                        bestMove = [i, j] 
                    }

                    alpha = max(alpha, bestScore) 
                    if (alpha >= beta) {
                        return bestScore
                    }
                }
            }
        }

        if (depth == 0) {
            board[bestMove[0]][bestMove[1]] = "O"
            endTurn()
        }

        return bestScore
    }

    else {
        //x"s turn
        let bestScore = Infinity;
        for (let i in state) {
            for (let j in state[i]) {
                if (state[i][j] == "") {

                    state[i][j] = "X"
                    let possibleScore = MinMax(state, true, depth+1, alpha, beta)
                    state[i][j] = ""

                    bestScore = min(possibleScore, bestScore)
                    beta = min(beta, bestScore)

                    if (beta <= alpha) {
                        return bestScore;
                    }
                }
            }
        }

        return bestScore
    }
}

function setup() {
    createCanvas(600, 600)
    textAlign(CENTER)
}

function title() {
    background(0)

    fill(0, 255*(Math.cos(frameCount/60) + 1), 255 * (Math.sin(frameCount/60) + 1))
    textSize(90)
    text("TIC-TAC-TOE", width/2, 100)

    textSize(50)

    fill(255)
    if (mouseY < 300 && mouseY > 200) {fill(255, 255, 0)}
    text("PLAY AGAINST HUMAN", width/2, 250)

    fill(255)
    if (mouseY < 500 && mouseY > 400) {fill(255, 255, 0)}
    text("PLAY AGAINST ROBOT", width/2, 450)

    fill(255)
    textSize(10)
    text("© Henry Ty 2020", 50, 590)
}

function isFull(state) {
    for (let i in state) {
        if (state[i].indexOf("") != -1) {
            return false
        }
    }

    return true;
}

function generateBoard() {
    for (let i=0; i<boardSize; i++) {
        board.push([])
        for (let j=0; j<boardSize; j++) {
            board[i].push("")
        }
    }
}

function display() {
    background(0)

    for (let i=1; i<boardSize; i++) {
        strokeWeight(8)
        stroke(255)

        var spacing = i*width/boardSize

        line(spacing, 0, spacing, height)
        line(0, spacing, width, spacing)
    }

    textSize(20)
    strokeWeight(2)
    if (turn == "X") {fill(255, 0, 0)}
    else {fill(0, 0, 255)}
    text(turn + "'s turn", 50, 20)


    strokeWeight(8)

    var align = width/boardSize;

    textSize(align * 0.6)
    for (let i in board) {
        for (let j in board[i]) {
            if (board[i][j] == "X") {fill(255, 0, 0)}
            else {fill(0, 0, 255)}

            text(board[i][j], i*align + (align/2), j*align + (align/1.5))
        }
    }
}

function startup() {
    background(0)

    textSize(50)
    fill(255)
    text("GRID SIZE: " + boardSize + "\n USE KEYBOARD \n \n CLICK TO CONTINUE", width/2, height/2)
}

function checkRows(player, state) {
    for(let i in state) {
        var won = true;
        for (let j in state[i]) {
            if (state[i][j] != player) {
                won = false;
            }
        }

        if (won) {return true}
    }
    return false;
};

function checkColumns(player, state) {
    for(let i in state) {
        var won = true;
        for (let j in state[i]) {
            if (state[j][i] != player) {
                won = false
                break;
            }
        }
        if (won) {return true}
    }
    return false;
};

function checkDiag1(player, state) {
    for(let i in state) { //check in this direction: \
        if (state[i][i] !== player) {
            return false
        }
    }
    return true
}

function checkDiag2(player, state) {
    for(let i in state) { //check in this direction: /
        if (state[state.length-i-1][i] !== player) {
            return false
        }
    }
    return true
}

function checkDiags(player, state) {
    return checkDiag1(player, state) || checkDiag2(player, state)
};

function checkWon(player, state) {  
    return (checkRows(player, state) || checkColumns(player, state) || checkDiags(player, state))
}

function game() {
    if (wait > 90) {
        wait = 0
        done = false

        //restart
        winner = null
        board = []; 
        generateBoard();

        if (computer) {turn = "O"}
    }

    if (done) {
        wait ++;
    }

    else if (turn == "O" && computer) {
        MinMax(board, true, 0, -Infinity, Infinity)
        return;
    }

    for (let i in players) {
        if (checkWon(players[i], board)) {
            winner = players[i]
            done = true;
        }
    }

    if (winner != null) {
        textSize(width/4)
        fill(0, 255, 0)
        text(winner + " WINS", width/2, height/2)
    }

    else if (isFull(board)) {
        textSize(width/4)
        fill(0, 255, 0)
        text("DRAW", width/2, height/2)

        if (done == false) {
            score[0] += 0.5;
            score[1] += 0.5;
        }

        done = true;
    }
};

function draw() {
    switch (screen) {
        case(0): //title
            title();
            break;
        case(1): //boot up the game
            if (computer) {    
                generateBoard();
                turn = "O"
                screen = 4;
                break
            }

            startup();
            break;
        case(4): //face the computer
        case(3): //human
            display();
            game();
            break;
    }
}

function keyTyped() {
    switch(key) {
        case("1"):
        case("3"):
        case("5"):
        case("7"):
        case("9"):
        case("2"):
        case("4"):
        case("6"):
        case("8"):
            boardSize = key
            break;
        default:
            boardSize = 3;
    }
}

function endTurn() {
    turn = players[(players.indexOf(turn)+1) % players.length]
}

function click() {
    var x = null;
    var y = null;
    for (let i=1; i<boardSize+1; i++) {
        if (mouseX < i*width/boardSize && x == null) {
            x = i - 1
        }
        if (mouseY < i*height/boardSize && y == null) {
            y = i - 1
        }
    }

    if (board[x][y] != "") {return}
    if (computer && turn == "O") {return}
    board[x][y] = turn;
    endTurn();
}

function mouseClicked() {
    switch (screen) {
        case(0):
            screen = 1
            computer = (mouseY < 500 && mouseY > 400)
            break
        case(1):
            generateBoard();
            screen = 3
            turn = random(players)
            break
        case(4):
        case(3):
            click()
            break;
        case(5):
    }
}