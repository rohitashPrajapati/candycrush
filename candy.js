function updateCandyPositions() {
    const boardElem = document.getElementById("board");
    const boardWidth = boardElem.offsetWidth;
    const boardHeight = boardElem.offsetHeight;
    const candyWidth = boardWidth / columns;
    const candyHeight = boardHeight / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            tile.style.transform = `translate(${c * candyWidth}px, ${r * candyHeight}px)`;
        }
    }
}
function getCandyColor(src) {
    // Extracts color name from src, ignoring striped suffixes
    let name = src.split("/").pop().split(".")[0];
    return name.replace("-Striped-Horizontal","").replace("-Striped-Vertical","");
}

const candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
const BLANK_IMAGE = "./images/blank.png";
const SCORE_INCREMENT = 30;
var board = [];
var rows = 9;
var columns = 9;
var score = 0;
var userMoveMade = false;
var userMoves = 0;


var currTile;
var otherTile;

function isBlank(tile) {
    return tile.src === BLANK_IMAGE || tile.src.includes("blank");
}


window.onload = function(){
    startGame();
    updateCandyPositions();
    document.getElementById("moves").innerText = userMoves;
    //every 1/10th of sec recalls this bloody func
    window.setInterval(function(){
        crushCandy();
        slideCandy();
        generateCandy();
        updateCandyPositions();
        document.getElementById("moves").innerText = userMoves;
    },100)
}

function randomCandy(){
    return candies[Math.floor(Math.random()* candies.length)]; // 0 to 5 (decimal numb)

}

function startGame(){
    for(let r =0; r<rows;r++){
        let row = [];
        for(let c=0; c<columns ;c++){
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";

            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend",dragEnd);

            // Touch event support for mobile
            tile.addEventListener("touchstart", touchStart, {passive: false});
            tile.addEventListener("touchmove", touchMove, {passive: false});
            tile.addEventListener("touchend", touchEnd, {passive: false});
// Touch event handlers
let touchStartTile = null;
let touchEndTile = null;

function touchStart(e) {
    e.preventDefault();
    touchStartTile = this;
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem && elem.tagName === "IMG" && elem.parentElement.id === "board") {
        touchEndTile = elem;
    }
}

function touchEnd(e) {
    e.preventDefault();
    if (!touchStartTile || !touchEndTile || touchStartTile === touchEndTile) {
        touchStartTile = null;
        touchEndTile = null;
        return;
    }
    // Simulate drag and drop logic
    currTile = touchStartTile;
    otherTile = touchEndTile;
    dragEnd();
    touchStartTile = null;
    touchEndTile = null;
}

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    updateCandyPositions();
    console.log(board);
}

function dragStart(){
    //this refers to tile that was clicked for drag
    currTile = this;

}

function dragOver(e){
    e.preventDefault();
}
function dragEnter(e){
    e.preventDefault();
}

function dragLeave(){

}

function dragDrop(){
    //this refers to the target that dropped on
    otherTile = this;
}

function dragEnd() {
    // Check if tiles are defined
    if (!currTile || !otherTile) {
        return;
    }
    //not crush empty 
    if (isBlank(currTile) || isBlank(otherTile)){
        return;
    }



    let currCoords = currTile.id.split("-"); // id="0-0" -> ["0", "0"]
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c-1 && r == r2;
    let moveRight = c2 == c+1 && r == r2;

    let moveUp = r2 == r-1 && c == c2;
    let moveDown = r2 == r+1 && c == c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;
        currTile.src = otherImg;
        otherTile.src = currImg;

        // Detect striped candy merge
        let isCurrHorizontal = currImg.includes("-Striped-Horizontal");
        let isCurrVertical = currImg.includes("-Striped-Vertical");
        let isOtherHorizontal = otherImg.includes("-Striped-Horizontal");
        let isOtherVertical = otherImg.includes("-Striped-Vertical");
        if ((isCurrHorizontal || isCurrVertical) && (isOtherHorizontal || isOtherVertical)) {
            // Always use the destination tile (otherTile) for explosion center
            window.stripedCombo = {
                r: r2,
                c: c2
            };
            userMoveMade = true;
            userMoves++;
            document.getElementById("moves").innerText = userMoves;
            return;
        }

        let validMove = checkValid();
        if (!validMove){
            let currImg = currTile.src;
            let otherImg = otherTile.src;
            currTile.src = otherImg;
            otherTile.src = currImg;
        }
        else {
            userMoveMade = true;
            userMoves++;
            document.getElementById("moves").innerText = userMoves;
        }
    }
}

function crushCandy (){
    crushThree();
    document.getElementById("score").innerText = score;
    // Reset user move flag after processing
    userMoveMade = false;
}

function crushThree() {
    // Track candies to crush
    let toCrush = Array.from(Array(rows), () => Array(columns).fill(false));

    // Check rows for groups of 3+ and 4 for striped
    for (let r = 0; r < rows; r++) {
        let c = 0;
        while (c < columns) {
            let start = c;
            let baseColor = getCandyColor(board[r][c].src);
            if (isBlank(board[r][c])) {
                c++;
                continue;
            }
            while (
                c < columns &&
                getCandyColor(board[r][c].src) === baseColor &&
                !isBlank(board[r][c])
            ) {
                c++;
            }
            let length = c - start;
            if (length >= 4) {
                for (let k = start; k < c; k++) {
                    toCrush[r][k] = true;
                }
                board[r][c-1].src = `./images/${baseColor}-Striped-Horizontal.png`;
                toCrush[r][c-1] = false;
            } else if (length >= 3) {
                for (let k = start; k < c; k++) {
                    toCrush[r][k] = true;
                }
            }
        }
    }

    // Check columns for groups of 3+ and 4 for striped
    for (let c = 0; c < columns; c++) {
        let r = 0;
        while (r < rows) {
            let start = r;
            let baseColor = getCandyColor(board[r][c].src);
            if (isBlank(board[r][c])) {
                r++;
                continue;
            }
            while (
                r < rows &&
                getCandyColor(board[r][c].src) === baseColor &&
                !isBlank(board[r][c])
            ) {
                r++;
            }
            let length = r - start;
            if (length >= 4) {
                for (let k = start; k < r; k++) {
                    toCrush[k][c] = true;
                }
                board[r-1][c].src = `./images/${baseColor}-Striped-Vertical.png`;
                toCrush[r-1][c] = false;
            } else if (length >= 3) {
                for (let k = start; k < r; k++) {
                    toCrush[k][c] = true;
                }
            }
        }
    }

    // Check for 2x2 squares
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < columns - 1; c++) {
            let candySrc = board[r][c].src;
            if (
                !isBlank(board[r][c]) &&
                board[r][c+1].src === candySrc &&
                board[r+1][c].src === candySrc &&
                board[r+1][c+1].src === candySrc
            ) {
                toCrush[r][c] = true;
                toCrush[r][c+1] = true;
                toCrush[r+1][c] = true;
                toCrush[r+1][c+1] = true;
            }
        }
    }

    // Striped candy explosion logic
    // Special combo: if two striped candies are merged, explode both row and column
    if (window.stripedCombo) {
        // Only explode the row and column of the destination tile
        let { r, c } = window.stripedCombo;
        for (let cc = 0; cc < columns; cc++) {
            toCrush[r][cc] = true;
        }
        for (let rr = 0; rr < rows; rr++) {
            toCrush[rr][c] = true;
        }
        window.stripedCombo = null;
    }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (toCrush[r][c]) {
                let src = board[r][c].src;
                if (src.includes("-Striped-Horizontal")) {
                    // Remove entire row
                    for (let cc = 0; cc < columns; cc++) {
                        if (!isBlank(board[r][cc])) {
                            toCrush[r][cc] = true;
                        }
                    }
                } else if (src.includes("-Striped-Vertical")) {
                    // Remove entire column
                    for (let rr = 0; rr < rows; rr++) {
                        if (!isBlank(board[rr][c])) {
                            toCrush[rr][c] = true;
                        }
                    }
                }
            }
        }
    }

    // Crush candies and update score
    let crushed = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (toCrush[r][c]) {
                board[r][c].src = BLANK_IMAGE;
                crushed++;
            }
        }
    }
    if (userMoveMade) {
        score += crushed * SCORE_INCREMENT;
    }
}

function checkValid(){
    // Check for row of 3+
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns-2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c+1];
            let candy3 = board[r][c+2];
            if (
                getCandyColor(candy1.src) === getCandyColor(candy2.src) &&
                getCandyColor(candy2.src) === getCandyColor(candy3.src) &&
                !isBlank(candy1)
            ) {
                return true;
            }
        }
    }

    // Check for column of 3+
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows-2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r+1][c];
            let candy3 = board[r+2][c];
            if (
                getCandyColor(candy1.src) === getCandyColor(candy2.src) &&
                getCandyColor(candy2.src) === getCandyColor(candy3.src) &&
                !isBlank(candy1)
            ) {
                return true;
            }
        }
    }

    // Check for 2x2 square
    for (let r = 0; r < rows-1; r++) {
        for (let c = 0; c < columns-1; c++) {
            let candySrc = board[r][c].src;
            if (
                !isBlank(board[r][c]) &&
                board[r][c+1].src === candySrc &&
                board[r+1][c].src === candySrc &&
                board[r+1][c+1].src === candySrc
            ) {
                return true;
            }
        }
    }

    return false;
}

function slideCandy(){
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                if (ind !== r) {
                    board[ind][c].src = board[r][c].src;
                }
                ind -= 1;
            }
        }
        for (let r = ind; r >= 0; r--) {
            board[r][c].src = BLANK_IMAGE;
        }
    }
    updateCandyPositions();
}

function generateCandy(){
    for (let c = 0; c < columns; c++){
        if (board[0][c].src.includes("blank")){
            board[0][c].src = "./images/" + randomCandy() + ".png"
        }
    }
    updateCandyPositions();
}