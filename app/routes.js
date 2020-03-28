// app/routes.js


var boardObj = require('./board');
var gamePlay = require('./gameplay');


module.exports = function(app, passport, board) {


	// HOME PAGE (with login links)
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});


	// LOGIN
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('login', {
            successRedirect : '/launch', // redirect to the secure launch section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            // console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// SIGNUP
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('signup', {
		successRedirect : '/launch', // redirect to the secure launch section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// PROFILE SECTION
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {

		if (req.query.request == "userGamesHistory") {

			// check the user role
			boardObj.getUserRole(req.user.username, function(err, data) {
				if (!err) {
					boardObj.getAllUsers(function(err4, data4) {
						if (err4) {
							res.status(500).send("Server error...");
						} else {
							var usersList = [req.user.username];
							var gameData = [];
							if (data == "ADMIN") {
								usersList = [];
								for (var k = 0; k < data4.length; k++) {
									usersList.push(data4[k].username);
								}
							}
							var count = 0;
							for(var i = 0; i < usersList.length; i++) {
								getUserGamePlayInfo (usersList[i], function(err2, data2) {
									count++

									if(!err2) {
										gameData = gameData.concat(data2);
									}
									if (count == usersList.length) {
										res.status(200).send(gameData);
									}
								});
							}
						}
					});

				} else {
					res.status(401).send("Invalid user...");
				}
			});


		} else {
			res.render('profile.ejs', {
				username : req.user.username
			});
		}


	});

	// LOGOUT
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	// After Login Launch Page
	app.get('/launch', isLoggedIn, function(req, res) {
		// console.log(req);
		if (req.query && req.query.request) {
			if (req.query.request == "ExistingGames") {
				// Access the database for active games
				boardObj.getAllBoardsWaitingForPlayers( function (err, data) {
					if (err) {
						res.status(500).send("Error: Server invalid board error");
					} else {
						// console.log(data);
						res.status(200).send(data);
					}
				});
			} else if (req.query.request == "JoinExistingGame" && req.query.gameTitle) {
				// Access the database
				var userName = req.user.username;
				// console.log(userName);
				boardObj.joinBoardPlay(req.query.gameTitle, userName, function (err, data) {
					if (err) {
						// res.status(500).send("Error: User already Joined");
						// res.redirect('/board');
						res.status(200).send("Joined the game successfully");
					} else {
						// console.log(data);
						res.status(200).send("Joined the game successfully");
						// res.redirect('/board');
					}
				});
			} else if (req.query.request == "isContinueGame") {
				var userName = req.user.username;
				boardObj.isUserPlayingOnBoard(userName, function(err, data) {
					if (!err) {
						res.status(200).send(data);
					} else {
						res.status(500).send("Internal server error");
					}
				});
			}
		} else {
			res.render('launch.ejs', {
				username : req.user.username
			});
		}
	});

	app.post('/launch', isLoggedIn, function(req, res) {

		if (req.body && req.body.request == "CreateNewGame") {
			if (req.body.gameTitle) {
				boardObj.createNewBoard(req.body.gameTitle, function (err, data) {
					if (err) {
						res.status(500).send("Server Error: Board already exists");
					} else {
						var userName = req.user.username;
						// console.log(req.user);
						// console.log(userName);
						boardObj.joinBoardPlay(req.body.gameTitle, userName, function (err1, data1) {
							if (err1) {
								res.status(500).send("Server Error: Board already exists");
							} else {
								// res.redirect('/board');
								res.status(200).send("Joined the game successfully");
							}
						});
					}
				});
			}

		}

	});

	// GAME BOARD
    app.get('/board', isLoggedIn, function(req, res) {

		// var _this = this;
		if (req.query && req.query.request) {

			if (req.query.request == "currentPlayingGame") {

				var userName = req.user.username;

				boardObj.getWaitingOrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						// console.log(err);
						res.status(500).send("Server Error: User is not active in any game");
						// res.redirect('/launch');
					} else {
						console.log(data);
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;
							getAllBoardData(board_name, null, null, function (err1, data1) {
								console.log(err1);
								console.log(data1);
								if (err1) {
									res.status(500).send("Server Error: Invalid board");
								} else {
									console.log(data1);
									// check if the game has finished...
									isGameFinished(board_name, data1.boardData, data1.cols, data1.rows, function (err2, data2, winner) {
										if (err2) {
											res.status(500).send("Server Error: Internal error");
										} else {
											console.log("isGameFinished");
											console.log(data2);
											if (data2 == true) {
												if (!winner) {
													winner = getWinnerFromPoints(data1.userData);
												}
												boardObj.endBoardPlay(board_name, winner, function(err9, data9) {
													if (err9) {
														res.status(500).send("Server Error: Internal error");
													} else {
														data1["gameFinished"] = true;
														for (var i = 0; i < data1.userData.length; i++) {
															if (data1.userData[i].userName == winner) {
																data1.userData[i].winner = true;
																break;
															}
														}
														res.status(200).send(data1);
													}
												});
											} else {
												res.status(200).send(data1);
											}
										}
									});
								}
							});

						}
					}
				});
			} else if (req.query.request == "isMyTurn") {
				var userName = req.user.username;
				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						// console.log(err);
						res.status(500).send("Server Error: User is not active in any game");
						// res.redirect('/launch');
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							boardObj.isUserTurn(userName, board_name, function(err1, data1) {
								if(err1) {
									res.status(500).send("Server Error: Internal error");
									console.log("Error when user tried to get active status...");
								} else {
									res.status(200).send(data1);
								}
							});
						}
					}
				});
			} else if (req.query.request == "startGame") {

				var userName = req.user.username;
				boardObj.getCurrWaitingBoardOfUser(userName, function (err, data) {
					// console.log("getCurrActiveBoardOfUser");
					// console.log(data);

					if (err) {
						// console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {

						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							boardObj.getNumUsersOnBoard(board_name, function(err2, data2) {
								if (data2 >= 2 && !err2) {
									// console.log("getNumUsersOnBoard");
									// console.log(data2);

									boardObj.startBoardPlay(board_name, function(err3, data3) {
										if (!err3 && data3) {
											// console.log("startBoardPlay");
											// console.log(data3);

											// success
											boardObj.setNextUserTurn(board_name, function (err5, data5) {
												// console.log("setNextUserTurn");
												// console.log(data5);

												if (err5) {
													res.status(500).send("Server Error: Internal error");
													// console.log("Internal error while updating the next tuser's urn");
												} else {
													checkForActiveUserHavingTurnInput(board_name);
													res.status(200).send("Game started...");
												}
											});

										} else {
											// failed
											res.status(500).send("Error: Unknown server error while starting the game");
										}
									});

								} else {
									// Error: not allowed to start game
									res.status(401).send("Error: At least 2 users required to play the game");
								}
							});


						}
					}
				});

			} if (req.query.request == "boardStatus") {
				var boardName = req.query.boardName;
				var userName = req.user.username;

				boardObj.getUserBoardStatus(boardName, userName, function(err, data) {
					if (err) {
						res.status(500).send("Internal server error");
					} else {
						res.status(200).send(data);
					}
				});
			} else if (req.query.request == "forfeitGame") {
				var userName = req.user.username;
				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					// console.log("getCurrActiveBoardOfUser");
					// console.log(data);

					if (err) {
						// console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;
							boardObj.setUserInActive(userName, board_name, function (err1, data1) {
								// console.log(err1);
								// console.log(data1);
								if (!err1) {
									boardObj.addMoveToBoard(userName, board_name, "forfeited", function(err2, data2){
										if (err2) {
											res.status(500).send("Error: Server internal error");
										} else {
											res.status(200).send("User forfeited...");
										}
									});

								} else {
									res.status(401).send("Error: Server internal error");
								}
							});
						}
					}
				});
			}

		} else {
			res.render('board.ejs', {
				username : req.user.username
			});
		}
	});

	app.post('/board', isLoggedIn, function(req, res) {

		if (req.body) {

			if (req.body.request == "addMove") {
				var moveValue = req.body.value;
				var userName = req.user.username;

				boardObj.getCurrActiveBoardOfUser(userName, function (err, data) {
					if (err) {
						// console.log(err);
						res.status(401).send("Error: User is not active in any game");
					} else {
						if (data && data.length >= 1) {
							var board_name = data[0].board_name;

							// Check if this user's turn
							boardObj.isUserTurn(userName, board_name, function(err1, data1) {
								if (!err1 && data1 == true) {
									boardObj.getUserSequence(userName, board_name, function(err2, data2) {
										if (err2) {
											// console.log(err);
											res.status(401).send("Error: User is not active in this board");
										} else {
											let userId = data2;

											getAllBoardData(board_name, userId, moveValue, function (err3, data3 ) {
												if (err3) {
													res.status(500).send("Error: Invalid move...");
												} else {
													// console.log(data3);

													// Add move to database
													boardObj.addMoveToBoard(userName, board_name, moveValue, function(err4, data4) {
														// console.log("addMoveToBoard");
														// console.log(data4);

														if (err4) {
															res.status(500).send("Server Error: Internal error");
														} else {
															boardObj.setNextUserTurn(board_name, function (err5, data5) {
																// console.log("setNextUserTurn");
																// console.log(data5);

																if (err5) {
																	res.status(500).send("Server Error: Internal error");
																} else {
																	// check if the game has finished...
																	isGameFinished(board_name, data3.boardData, data3.cols, data3.rows, function (err7, data7, winner) {
																		if (err7) {
																			res.status(500).send("Internal server error...");
																		} else {
																			if (data7 == true) {
																				if (!winner) {
																					winner = getWinnerFromPoints(data3.userData);
																				}
																				// End the game
																				boardObj.endBoardPlay(board_name, winner, function(err9, data9){
																					if (err9) {
																						res.status(500).send("Internal server error...");
																					} else {
																						data3["gameFinished"] = true;
																						for (var i = 0; i < data3.userData.length; i++) {
																							if (data3.userData[i].userName == winner) {
																								data3.userData[i].winner = true;
																								break;
																							}
																						}

																						res.status(200).send(data3);
																					}
																				});

																			} else {
																				checkForActiveUserHavingTurnInput(board_name);
																				res.status(200).send(data3);
																			}
																		}
																	});
																}
															});
														}

													});
												}
											});

										}

									});

								} else {
									res.status(401).send("Error: It is not this user's turn...");
								}
							});

						}

					}

				});
			}
		}

	});



};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function getBoardStatus(boardName, userName, done) {
	if (boardName && userName) {
		boardObj.getUserBoardStatus(boardName, userName, function (err, data) {
			if (err) {
				done (err, null)
			} else if (data) {
				done (null, data);
			}
		});
	}

}

function getUserTurnName(boardName, done) {
	if (boardName) {
		boardObj.getUserHavingTurn(boardName, function (err, data) {
			if (err) {
				done (err, null);
			} else {
				done (null, data);
			}
		});
	}
}

function getAllBoardData(board_name, userID, move, done) {

	var retObject = {};
	var rows = 6;
	var cols = 6;
	retObject["boardName"] = board_name;
	retObject["rows"] = rows;
	retObject["cols"] = cols;
	retObject["boardData"] = null;
	retObject["userData"] = null;
	retObject["gameFinished"] = null;

	boardObj.getAllMovesOfBoard(board_name, function(err1, data1) {
		if (!err1 && data1) {
			// console.log("getAllMovesOfBoard");
			// console.log(data1);

			var movesList = [];
			var userIdList = [];
			var boardState = null;
			for (var i = 0; i < data1.length; i++) {
				movesList.push(data1[i].move_value);
				// userIdList.push(0);
				boardObj.getUserSequence(data1[i].username, board_name, function(err2, data2) {
					if (!err2 && data2) {

						// console.log("getUserSequence");
						// console.log(data2);

						userIdList.push(data2);
						// console.log(userIdList);
						// console.log(i);
						// console.log(data1.length);

						if (userIdList.length == data1.length) { // finished all elements

							if (move && userID) {
								userIdList.push(userID);
								movesList.push(move);
							}

							// Call the function for Board state
							boardState = gamePlay.getCurrentBoardState(userIdList, movesList, rows, cols);
							if (!boardState) {
								done ("Invalid Move", null);
								return;
							}
							retObject["boardData"] = boardState;

							boardObj.getUsersOfBoard(board_name, function (err3, data3) {
								if (!err3 && data3) {

									getUsersMovesCount(data3, board_name, function (err5, data5) {
										// console.log(data5);
										if (err5) {
											done (err5, null);
										} else {
											var userdata = [];
											for (var j = 0; j < data3.length; j++) {
												userdata.push({
													"userName": data3[j].username,
													"userIndex": data3[j].user_seq,
													"color": data3[j].colorid,
													"points": gamePlay.getUserPoints(data3[j].user_seq, boardState, rows, cols),
													"winner": false,
													"numMoves": (50-data5[j])
												});
											}
											retObject["userData"] = userdata;

											done(null, retObject);
										}
									});

								} else {
									done (err3, null);
								}

							});
						}
					} else {
						done(err2, null);
					}
				});
			}

			if (data1.length <= 0) {

				// console.log("length");

				// Add input
				if (userID && move) {
					userIdList.push(userID);
					movesList.push(move);
				}

				boardState = gamePlay.getCurrentBoardState(userIdList, movesList, rows, cols);
				if (!boardState) {
					done ("Invalid Move", null);
					return;
				}

				retObject["boardData"] = boardState;
				boardObj.getUsersOfBoard(board_name, function (err3, data3) {
					if (!err3 && data3) {

						// console.log("getUsersOfBoard");
						// console.log(data3);

						getUsersMovesCount(data3, board_name, function (err5, data5) {
							if (err5) {
								done (err5, null);
							} else {
								var userdata = [];
								for (var j = 0; j < data3.length; j++) {
									userdata.push({
										"userName": data3[j].username,
										"userIndex": data3[j].user_seq,
										"color": data3[j].colorid,
										"points": gamePlay.getUserPoints(data3[j].user_seq, boardState, rows, cols),
										"winner": false,
										"numMoves": (50-data5[j])
									});
								}
								retObject["userData"] = userdata;

								done(null, retObject);
							}
						});
					} else {
						done(err3, null);
					}

				});
			}



		} else {
			done (err1, null);
		}
	});

}

function getUsersMovesCount(usersList, boardName, done) {

	var userMovesList = [];
	for (var i = 0;i < usersList.length; i++) {
		boardObj.getNumberOfMovesOfUser(boardName, usersList[i].username, function(err, data) {

			if (err) {
				done (err, null);
			} else {
				userMovesList.push(data);

				if (userMovesList.length >= usersList.length) {
					done (null, userMovesList);
				}
			}

		});
	}

}

function getWinnerFromPoints(userData) {
	var maxPoints = 0;
	var winner = "";
	for (var i = 0; i < userData.length; i++) {
		if (maxPoints < userData[i].points) {
			maxPoints = userData[i].points;
			winner = userData[i].userName;
		}
	}

	return winner;
}


function isGameFinished(boardName, boardState, cols, rows, done) {

	boardObj.getBoardStatus(boardName, function (error, dataset) {
		if (error) {
			done (error, null, null);
		} else {
			if (dataset == "ACTIVE") {
				if (true == gamePlay.isBoardFullyOccupiedBySameUser(boardState, rows, cols)) {
					var winner = gamePlay.getAnyOwnerOfCell(boardState, rows, cols);
					done (null, true, winner)
				} else {
					boardObj.getMinNumMovesByAllUsersOnBoard(boardName, function(err, data) {
						console.log("getMinNumMovesByAllUsersOnBoard");
						console.log(data);
						if (err) {
							done (err, null, null);
						} else {
							if (data >= 50) {
								done (null, true, null);
							} else {
								boardObj.getActiveUsersOnBoard(boardName, function (err2, data2) {
									if (err2) {
										done (err2, null, null);
									} else {
										console.log("getActiveUsersOnBoard");
										console.log(data2);
										if (data2 && data2.length <= 1) {
											done (null, true, data2[0].username);
										} else {
											done (null, false, null);
										}
									}
								});
							}
						}
					});
				}
			} else {
				done (null, false, null);
			}
		}
	});

}

var lastUserHavingTurn = null;
var turnCheckTimeout = null;

function checkForActiveUserHavingTurnInput(boardName) {

	if (turnCheckTimeout) {
		clearTimeout(turnCheckTimeout);
	}

	boardObj.getUserHavingTurn(boardName, function(err, data) {
		if (err) {
			// error
			// done(err, null);
		} else {
			lastUserHavingTurn = data;
			turnCheckTimeout = setTimeout(isSameActiveUser, 15000, boardName);
			// done(null, data);
		}
	});


}

function isSameActiveUser(boardName) {

	boardObj.getUserHavingTurn(boardName, function(err, data) {
		if (err) {
			//error
			// done(err, null);
		} else {
			if (lastUserHavingTurn == data) {
				boardObj.addMoveToBoard(lastUserHavingTurn, boardName, "Timeout", function(err1, data1) {
					if (err1) {
						// Error
					} else {
						boardObj.setNextUserTurn(boardName, function(err2, data2) {
							if (err2) {
								// Error
							} else {
								boardObj.getNumLastConsecutiveTimeoutsOfUser(boardName, lastUserHavingTurn, function(err2, data2){
									if (!err2) {
										if (data2 >= 3) {
											// forfeit the game for this user
											boardObj.setUserInActive(lastUserHavingTurn, boardName, function (err3, data3) {
												if (!err3) {
													boardObj.addMoveToBoard(lastUserHavingTurn, boardName, "forfeited", function(err4, data4){
													});
												}
											});
										}
									}
								});
								checkForActiveUserHavingTurnInput();
							}
						});
					}
				});
			}
		}
	});
}

function getUserGamePlayInfo(username, done) {
	boardObj.getUsersCompletedBoards(username, function(err, data) {
		if (err) {
			console.log(err);
			done (err, null);
		} else {
			var gamesData = [];
			if (data.length <= 0) {
				done(null, gamesData);
			}
			var numBoardsprocessed = 0;
			for (var i = 0; i < data.length; i++) {
				var currData = data[i];

				gamesData.push({"user": username, "boardName": currData.board_name, "start": currData.startTime,
				"end": currData.endTime, "color": currData.colorid, "forfeited": !currData.isActive, "winner": currData.winner, "moveSeq": null});

				boardObj.getAllMovesOfBoard(currData.board_name, function(err1, data1) {
					numBoardsprocessed++;
					if (err1) {
						done(err1, null);
						console.log(err1);
					} else {
						var moveSeq = [];
						for (var j = 0; j < data1.length; j++) {
							moveSeq.push({"userName": data1[j].username, "moveCellId": data1[j].move_value});
						}
						for (var k = 0; k < gamesData.length; k++) {
							if (data1.length > 0) {
								if (gamesData[k].boardName == data1[0].board_name) {
									gamesData[k].moveSeq = moveSeq;
								}
							}
						}
					}

					if(numBoardsprocessed >=  gamesData.length) {
						done(null, gamesData);
					}

				});
			}
		}
	});
}



