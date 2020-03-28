

// app/board.js

// DATABASE connection
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// Here, all the application interaction with databse is needed

module.exports = {

    //
    // GET METHODS
    //

    getColor: function (seq) {
        switch (seq) {
            case 1: return "blue";
            case 2: return "green";
            case 3: return "red";
            case 4: return "black";
            case 5: return "brown";
            case 6: return "DarkSeaGreen";
            case 7: return "DarkSalmon";
            case 8: return "DeepPink";
        }

        return "DarkGray";
    },

    isUserPlayingOnBoard: function (username, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status != \"COMPLETED\" AND isActive = 1";

        connection.query (command, [username], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    done(null, true);
                } else {
                    done (null, false);
                }
            }
        });

    },

    getWaitingOrActiveBoardOfUser: function (userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status != \"COMPLETED\" AND isActive = 1";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });

    },

    getCurrActiveBoardOfUser: function (userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status = \"ACTIVE\" AND isActive = 1";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });

    },

    getCurrWaitingBoardOfUser: function (userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status = \"WAITING\" AND isActive = 1";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });

    },

    getUserPoints: function (username, board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].points);
            }
        });
    },

    getUserColor: function (username, board_name, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name= ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].colorid);
            }
        });
    },

    getUserSequence: function (username, board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [board_name, username], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].user_seq);
            }
        });
    },

    getBoardStartTime: function (board_name, done) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].startTime);
            }
        });

    },

    getBoardEndTime: function (board_name, done) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].endTime);
            }
        });
    },

    getUserBoardStatus: function (board_name, userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";
        connection.query (command, [board_name, userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].board_status);
            }
        });
    },

    getBoardStatus: function (board_name, done) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].board_status);
            }
        });
    },

    getAllMovesOfBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        // console.log(board_name);
        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                // console.log("getAllMovesOfBoard");
                // console.log(rows);
                done(null, rows);
            }
        });

    },

    getNumberOfMovesOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows.length);
            }
        });
    },

    getNumberOfMovesOfUser: function(boardName, userName, done) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [boardName], function(err, rows) {

            if (err) {
                done (err, null);
            } else if (rows && rows.length > 0) {
                console.log(userName);
                var command1 = "SELECT * FROM PLAY_MOVE WHERE board_id = ? AND username = ?";
                connection.query (command1, [rows[0].board_id, userName], function(err1, rows1) {
                    if (err1) {
                        done(err1, null);
                    } else if (rows1) {
                        done (null, rows1.length);
                    }

                });
            }

        });
    },

    getNumLastConsecutiveTimeoutsOfUser: function(boardName, userName, done) {
        var command = "SELECT * FROM BOARD WHERE board_name = ?";
        connection.query (command, [boardName], function(err, rows) {

            if (err) {
                done (err, null);
            } else if (rows && rows.length > 0) {
                var command1 = "SELECT * FROM PLAY_MOVE WHERE board_id = ? AND username = ?";
                connection.query (command1, [rows[0].board_id, userName], function(err1, rows1) {
                    if (err1) {
                        done(err1, null);
                    } else if (rows1) {
                        var count = 0;
                        for (var i = rows1.length-1; i >= 0 ; i--) {
                            if (rows1[i].move_value == "Timeout") {
                                count++;
                            } else {
                                break;
                            }
                        }
                        done (null, count);
                    }

                });
            }

        });
    },

    getLastMoveUserOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN PLAY_MOVE ) WHERE board_name = ? ORDER BY move_seq ASC";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[rows.length-1].username);
            }
        });

    },

    getUsersOfBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });
    },

    getNumUsersOnBoard: function (board_name, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows.length);
            }
        });
    },

    getAllActiveBoards: function (done) {
        var command = "SELECT * FROM BOARD WHERE board_status = \"ACTIVE\"";

        connection.query (command, function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });
    },

    getAllBoardsWaitingForPlayers: function (done) {
        var command = "SELECT * FROM BOARD WHERE board_status = \"WAITING\"";

        connection.query (command, function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows) {
                done(null, rows);
            }
        });
    },

    getBoardId: function (board_name, done) {

        var command = "SELECT * FROM BOARD WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else if(rows && rows.length > 0) {
                done(null, rows[0].board_id);
            }
        });
    },

    getUsersCompletedBoards: function (userName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE username = ? AND board_status = \"COMPLETED\"";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                done (err, null);
            } else {
                done (null, rows);
            }
        });

    },

    //
    // SET/CREATE METHODS
    //

    createNewBoard: function (board_name, done) {

        var command = "INSERT INTO BOARD (board_name, board_status) VALUES (?, \"WAITING\")";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                done(null, rows);
            }
        });
    },

    joinBoardPlay: function (boardName, username, done) {

        console.log("joinBoardPlay");
        var _this = this;
        this.getBoardId(boardName, function(err, data) {
            if (!err) {
                var boardId = data;
                _this.getNumUsersOnBoard(boardName, function(err1, data1) {
                    console.log(data1);
                    if (!err1) {
                        var numUsers = data1;
                        var color = _this.getColor(numUsers+1);

                        var command = "INSERT INTO BOARD_PLAYERS (board_id, username, colorid, user_seq) VALUES (?, ?, ?, ?)";

                        connection.query (command, [boardId, username, color, numUsers+1], function(err3, rows) {
                            if (err3) {
                                done(err3, null);
                            } else {
                                console.log(rows);
                                done(null, rows);
                            }

                        });
                    } else {
                        done(err1, null);
                    }

                });
            } else {
                console.log(err); done(err, null);
            }

        });

    },

    startBoardPlay: function (board_name, done) {
        var _this = this;
        var command = "UPDATE BOARD SET startTime = (SELECT NOW()) WHERE board_name = ?";

        connection.query (command, [board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                _this.setBoardStatus(board_name, "ACTIVE", function (err1, data1) {
                    if (!err1 && data1) {
                        done(null, rows);
                    } else {
                        done(err1, null);
                    }
                });
            }
        });
    },

    endBoardPlay: function (board_name, winnerName, done) {

        var _this = this;
        var command = "UPDATE BOARD SET endTime = (SELECT NOW()), winner = ? WHERE board_name = ?";

        connection.query (command, [winnerName, board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                console.log("endBoardPlay");
                console.log(rows);
                _this.setBoardStatus(board_name, "COMPLETED", function (err1, data1) {
                    console.log(data1);
                    if (!err1 && data1) {
                        done(null, rows);
                    } else {
                        done(err1, null);
                    }
                });
            }
        });
    },

    setBoardStatus: function (board_name, boardStatus, done) {
        // boardStatus:= COMPLETED || WAITING || ACTIVE

        if (boardStatus != "COMPLETED" && boardStatus != "WAITING" && boardStatus != "ACTIVE") {
            done("Invalid status" , null);
        }

        var command = "UPDATE BOARD SET board_status = ? WHERE board_name = ?";

        connection.query (command, [boardStatus, board_name], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                done(null, rows);
            }
        });
    },

    addMoveToBoard: function (username, boardName, moveValue, done) {

        var _this = this;
       this.getBoardId(boardName, function (err1, data1) {
           if (!err1) {
                var boardId = data1;
                _this.getNumberOfMovesOnBoard(boardName, function(err2, data2) {
                    if (!err2) {
                        var numMoves = data2;
                        var command = "INSERT INTO PLAY_MOVE (board_id, username, move_seq, move_value) VALUES (?, ?, ?, ?)";
                        connection.query (command, [boardId, username, numMoves+1, moveValue], function(err, rows) {
                            if (err) {
                                console.log(err); done(err, null);
                            } else {
                                done(null, rows);
                            }
                        });

                    } else {
                        done(err2, null);
                    }
                });
           } else {
                done(err1, null);
           }

       });


    },

    updateUserPointsOnBoard: function (board_name, userName, pointsVa, done) {

        var _this = this;
        this.getBoardId(board_name, function (err1, data1) {

            if (!err1) {
                var boardId = data1;
                var command = "UPDATE BOARD_PLAYERS SET points = ? WHERE board_id = ? AND username = ?";
                connection.query (command, [pointsVal, boardId, userName], function(err, rows) {
                    if (err) {
                        console.log(err); done(err, null);
                    } else {
                        done(null, rows);
                    }
                });
            } else {
                done(err1, null);
            }
        });
    },

    setNextUserTurn: function(boardName, done) {

        console.log("setNextUserTurn");
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ?";
        connection.query (command, [boardName], function(err, rows) {
            console.log("Step 1");
            console.log(rows);

            if (err) {
                console.log(err); done(err, null);
            } else {
                console.log("Step 2");
                console.log(rows);

                var activeUserRows = [];
                var lastTurnUserId = 0;
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].isTurn == 1) {
                        lastTurnUserId = rows[i].user_seq;
                    }
                    if (rows[i].isActive == 1) {
                        activeUserRows.push(rows[i]);
                    }
                }

                rows = activeUserRows;
                console.log(activeUserRows);
                console.log(rows);

                console.log("Step 4");
                console.log(lastTurnUserId);

                var minUserIndex = 0;
                var maxUserIndex = 0;
                var nextUserIndex = lastTurnUserId+1000;

                for (var i = 0; i < rows.length; i++) {
                    if (i == 0) {
                        minUserIndex = rows[i].user_seq;
                        maxUserIndex = rows[i].user_seq;
                    } else {
                        if (minUserIndex > rows[i].user_seq) {
                            minUserIndex = rows[i].user_seq;
                        }

                        if (maxUserIndex < rows[i].user_seq) {
                            maxUserIndex = rows[i].user_seq;
                        }
                    }
                    if (nextUserIndex > rows[i].user_seq && rows[i].user_seq > lastTurnUserId) {
                        nextUserIndex = rows[i].user_seq;
                    }
                }

                console.log("Step 5");
                console.log(nextUserIndex);

                var finalUserTurnId = 0;
                if (lastTurnUserId == 0) {
                    finalUserTurnId = minUserIndex;
                } else {
                    if (lastTurnUserId == maxUserIndex) {
                        finalUserTurnId = minUserIndex;
                    } else {
                        finalUserTurnId = nextUserIndex;
                    }
                }
                console.log("Step 6");
                console.log(finalUserTurnId);

                if (finalUserTurnId != 0) {
                    var command1 = "UPDATE BOARD_PLAYERS SET isTurn = 1 WHERE board_id = ? AND user_seq = ?";
                    connection.query (command1, [rows[0].board_id, finalUserTurnId], function(err1, rows1) {

                        console.log("Step 7");
                        console.log(rows1);

                        if (err1) {
                            done(err1, null);
                        } else {
                            if (lastTurnUserId !== 0) {
                                var command2 = "UPDATE BOARD_PLAYERS SET isTurn = 0 WHERE board_id = ? AND user_seq = ?";
                                connection.query (command2, [rows[0].board_id, lastTurnUserId], function(err2, rows2) {
                                    console.log("Step 8");
                                    console.log(rows2);

                                    if (err2) {
                                        console.log(err2);
                                        done(err2, null);
                                    } else {
                                        done(null, rows1);
                                    }
                                });
                            } else {
                                done(null, rows1);
                            }
                        }
                    });
                }
            }
        });


    },

    isUserTurn: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isTurn == 1) {
                        done(null, true);
                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },

    isUserActive: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isActive == 1) {
                        done(null, true);
                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },

    setUserInActive: function(userName, boardName, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND username = ?";

        connection.query (command, [boardName, userName], function(err, rows) {
            if (err) {
                console.log(err); done(err, null);
            } else {
                if (rows && rows.length > 0) {
                    if (rows[0].isActive == 1) {
                        var command1 = "UPDATE BOARD_PLAYERS SET isActive = 0 WHERE board_id = ? AND username = ?";

                        connection.query (command1, [rows[0].board_id, userName], function(err1, rows1) {
                            if (err1) {
                                console.log(err1);
                                done(err1, null);
                            } else if (rows1) {
                                done(null, rows1);
                            }
                        });

                    } else {
                        done(null, false);
                    }
                }
            }
        });

    },

    getUserHavingTurn: function (boardName, done) {
        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND isActive = 1";

        connection.query (command, [boardName], function(err, rows) {

            if (err) {
                done (err, null);
            } else if (rows && rows.length > 0) {
                done (null, rows[0].username);
            }

        });
    },

    getActiveUsersOnBoard: function (boardName, done) {

        var command = "SELECT * FROM (BOARD NATURAL JOIN BOARD_PLAYERS) WHERE board_name = ? AND isActive = 1";

        connection.query (command, [boardName], function(err, rows) {
            if (err) {
                done (err, null);
            } else if (rows) {
                done (null, rows);
            }
        });
    },

    getMinNumMovesByAllUsersOnBoard: function(boardName, done) {

        this.getBoardId(boardName, function(err1, data1) {
            if (err1) {
                done (err1, null);
            } else {
                var boardId = data1;
                var command = "SELECT username, COUNT(*) as num_moves FROM (PLAY_MOVE NATURAL JOIN BOARD_PLAYERS) WHERE board_id = ? GROUP BY username";

                connection.query (command, [boardId], function(err, rows) {
                    if (err) {
                        done (err, null);
                    } else if (rows) {
                        var minMoves = 10000;
                        var user = null;
                        for (var i = 0; i < rows.length; i++) {
                            if (minMoves > rows[i].num_moves) {
                                minMoves = rows[i].num_moves
                            }
                        }
                        if (rows.length <= 0) {
                            minMoves = 0;
                        }
                        done (null, minMoves);
                    }
                });
            }

        });
    },

    getUserRole: function(userName, done) {
        var command = "SELECT * FROM users WHERE username = ?";

        connection.query (command, [userName], function(err, rows) {
            if (err) {
                done (err, null);
            } else if (rows && rows.length > 0) {
                done (null, rows[0].role);
            } else {
                done ("User donesnot exists", null);
            }
        });
    },

    setUserRole: function(userName, role, done) {
        var command = "UPDATE users SET role = ? WHERE username = ?";

        connection.query (command, [role, userName], function(err, rows) {
            if (err) {
                done (err, null);
            } else {
                done (null, rows);
            }
        });
    },

    getAllUsers: function(done) {
        var command = "SELECT * FROM users";
        connection.query (command, function(err, rows) {
            if (err) {
                done (err, null);
            } else {
                done (null, rows);
            }
        });
    },
};






