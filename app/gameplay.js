


// Here, all the gameplay related logic

module.exports = {


    addMove: function (userIndex, move, boardState, numRows, numCols, isBurst) {

        let state = boardState[move];

        if (!state) {
            return null;
        }

        if (state && state.length == 2) {

            if (state[0] != 0 && !isBurst && userIndex !== state[0]) {
                // Invalid move
                return null;
            }

            if (isBurst == true) {

                if (state[0] == userIndex) { // When same user's place
                    boardState = this.addMove(userIndex, move, boardState, numRows, numCols, false);

                } else { // different user's place

                    state[0] = userIndex;
                    state[1] = 1;
                    boardState[move] = state;
                }

            } else { // Not activated through burst

                var value = state[1];
                if (value <= 2) { // No burst will happen

                    value++;
                    state[0] = userIndex;
                    state[1] = value;
                    boardState[move] = state;

                } else if (value == 3) {    // Burst will happen

                    var boardPos = parseInt(move);
                    var rowIndex = Math.floor(boardPos/10);
                    var colIndex = (boardPos % 10);

                    state[0] = 0;
                    state[1] = 0;
                    boardState[move] = state;

                    if (rowIndex > 1) {
                        var key = ""+(rowIndex-1)+""+(colIndex);
                        boardState = this.addMove (userIndex, key, boardState, numRows, numCols, true);
                    }

                    if (rowIndex < numRows) {
                        var key = ""+(rowIndex+1)+""+(colIndex);
                        boardState = this.addMove (userIndex, key, boardState, numRows, numCols, true);
                    }

                    if (colIndex > 1) {
                        var key = ""+(rowIndex)+""+(colIndex-1);
                        boardState = this.addMove (userIndex, key, boardState, numRows, numCols, true);
                    }

                    if (colIndex < numCols) {
                        var key = ""+(rowIndex)+""+(colIndex+1);
                        boardState = this.addMove (userIndex, key, boardState, numRows, numCols, true);
                    }

                }

            }
        }

        return boardState;

    },

    getCurrentBoardState: function (userIndexList, movesList, rows, cols) {

        // console.log("getCurrentBoardState");

        // create the emplty board
        let board = {};
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var key = ""+(i+1)+""+(j+1);
                board[key] = [0,0];
            }
        }

        for (var i = 0; i < userIndexList.length; i++) {
            if (movesList[i] == "Timeout" || movesList[i] == "forfeited") {
                continue;
            }

            board = this.addMove(userIndexList[i], movesList[i], board, rows, cols, false);
            if (!board) { // Invalid move
                return null;
            }
        }

        // console.log(board);

        return board;
    },

    getUserPoints: function(userId, boardState, rows, cols) {

        var points = 0;

        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var key = ""+(i+1)+""+(j+1);
                var state = boardState[key];
                if (state && state.length == 2) {
                    if (state[0] == userId) {
                        points = points + 10;
                    }
                }
            }
        }


        return points;

    },

    isBoardFullyOccupiedBySameUser: function(boardState, rows, cols) {

        var cellOwner = null;
        var isFinished = true;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var key = ""+(i+1)+""+(j+1);
                var state = boardState[key];
                if (state && state.length == 2) {
                    if (!cellOwner && state[0] != 0) {
                        cellOwner = state[0];
                    } else {
                        if (cellOwner != state[0]) {
                            isFinished = false;
                            return isFinished;
                        }
                    }
                }
            }
        }

        if (cellOwner == "") {
            return false;
        }

        return isFinished;

    },

    getAnyOwnerOfCell: function(boardState, rows, cols) {
        key = "11";
        var state = boardState[key];
        if (state && state.length == 2) {
            return state[0];
        }

    }



};

