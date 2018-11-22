var config = {
  apiKey: "AIzaSyBXXNTYLfHjOUus5uKt4SM-78MGlqKdQYc",
  authDomain: "rock-paper-scissors-d9f3b.firebaseapp.com",
  databaseURL: "https://rock-paper-scissors-d9f3b.firebaseio.com/",
  projectId: "rock-paper-scissors-d9f3b",
  storageBucket: "rock-paper-scissors-d9f3b.appspot.com",
  messagingSenderId: "467095131694"
};
firebase.initializeApp(config);
var database = firebase.database();
var currentPlayer;
var opponent;
var wins = 0;
var losses = 0;
var draws = 0;
var count = 1;
var counter;
var gameId;
var currentGame = {
  status: "Pending",
  player1: "TBD",
  player2: "TBD"
};

$( document ).ready(function() {
  if(!url_query('gameId')) {
    currentPlayer = 'player1';
    opponent = 'player2';
    gameId = moment().valueOf();
    database.ref(gameId).set(currentGame);
    subscribeGame();
    renderGame();
  } else {
    currentPlayer = 'player2';
    opponent = 'player1';
    gameId = url_query('gameId');
    currentGame.status = "Started";
    database.ref(gameId).set(currentGame);
    subscribeGame();
  }
});

function updateScore() {
  if (currentGame.player1 !== 'TBD' && currentGame.player2 !== 'TBD') {
    if (currentGame.player1 === currentGame.player2) {
      currentGame.status = 'Draw';
      draws++;
    } else if (
      (currentGame.player1 === 'Rock' && currentGame.player2 === 'Scissors') ||
      (currentGame.player1 === 'Paper' && currentGame.player2 === 'Rock') ||
      (currentGame.player1 === 'Scissors' && currentGame.player2 === 'Paper')
    ) {
      currentGame.status = 'player1';
      currentPlayer === 'player1' ? wins++ : losses++;
    } else {
      currentGame.status = 'player2';
      currentPlayer === 'player2' ? wins++ : losses++;
    }
  }
}

function resetCounter() {
  if(currentGame.status === 'Started' && currentGame.player1 === 'TBD' && currentGame.player2 === 'TBD') {
    counter = null;
  }
}

function subscribeGame() {
  database.ref(gameId).on("value", function(snapshot) {
    var game = snapshot.val();
    currentGame.status = game.status;
    currentGame.player1 = game.player1;
    currentGame.player2 = game.player2;
    updateScore();
    resetCounter();
    renderGame();
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

function renderGame() {
  if (currentGame.status === 'Pending') {
    $("#message").html("Provide the following url to the other player to get started! <br/> <span class='link'>" + window.location.href + "?gameId=" + gameId + "</span>");
  } else if (currentGame.status === 'Started') {
    $("#message").html("Please make a selection! <br/>").attr('class', 'message');
    $("#yourChoice").html("Your Choice <br/>").attr('class', 'choiceMessage');
    $("#opponentChoice").html("Opponent Selection <br/>").attr('class', 'choiceMessage');
    renderChoices();
  } else if (currentGame.status === 'Draw') {
    $("#message").html("It's a draw! <br/>").attr('class', 'message');
    renderChoices();
    renderScore();
  } else if (currentGame.status === currentPlayer) {
    $("#message").html("You Won! <br/>").attr('class', 'message');
    renderChoices();
    renderScore();
  } else if (currentGame.status === opponent)  {
    $("#message").html("You lose! <br/>").attr('class', 'message');
    renderChoices();
    renderScore();
  }
}

function renderChoices() {
  //Render your Choices
  $("#choices").empty();
  var choices = $("<div>");
  $("#choices").append(choices);
  if(currentGame[currentPlayer] === 'TBD') {
    var rock = $("<div>").attr('id', 'Rock').attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Rock.png').attr('class', 'choices')).on('click', chooseOption);
    choices.append(rock);
    var paper = $("<div>").attr('id', 'Paper').attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Paper.png').attr('class', 'choices')).on('click', chooseOption);
    choices.append(paper);
    var scissors = $("<div>").attr('id', 'Scissors').attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Scissors.png').attr('class', 'choices')).on('click', chooseOption);
    choices.append(scissors);
  } else {
    var choice = $("<div>").attr('id', currentGame[opponent]).attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/' + currentGame[currentPlayer] + '.png').attr('class', 'choices'));
    choices.append(choice);
  }

  //Render Opponent Choices
  if (currentGame.status === 'Started' && !counter) {
    counter = setInterval(function(){
      var opponentChoices = $("#opponentChoices");
      opponentChoices.empty();
      if (count%3 === 0) {
        var rock = $("<div>").attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Rock.png').attr('class', 'choices'));
        opponentChoices.append(rock);
      } else if (count%3 === 1) {
        var paper = $("<div>").attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Paper.png').attr('class', 'choices'));
        opponentChoices.append(paper);
      } else if(count%3 === 2) {
        var scissors = $("<div>").attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/Scissors.png').attr('class', 'choices'));
        opponentChoices.append(scissors);
      }
      count++;
    }, 1000);
  } else if (currentGame.status !== 'Pending' && currentGame.status !== 'Started') {
    clearInterval(counter);
    var opponentChoices = $("#opponentChoices");
    opponentChoices.empty();
    var choice = $("<div>").attr('id', currentGame[opponent]).attr('class','col-lg-3 choices').append($("<img>").attr('src','assets/images/' + currentGame[opponent] + '.png').attr('class', 'choices'));
    opponentChoices.append(choice);
  }
}

function renderPlayAgain() {
  $("#playAgain").empty();
  $("#playAgain").append($("<div>").attr('class','col-lg-12 restart').append($("<button>").attr('type','button').attr('class', 'btn-primary').on('click', restartGame).html('Play Again')));
}

function restartGame() {
  alert('Restart');
  counter = null;
  currentGame = {
    status: "Started",
    player1: "TBD",
    player2: "TBD"
  };
  database.ref(gameId).set(currentGame);
  renderGame();
}

function renderScore() {
  renderPlayAgain();
  $("#score").empty();
  var score = $("<div>");
  $("#choices").append(choices);
  var winDiv = $("<div>").attr('class', 'col-lg-4 scoreBlock').append($("<span>").attr('class', 'score').html("Wins: " + wins));
  score.append(winDiv);
  var lossDiv = $("<div>").attr('class', 'col-lg-4 scoreBlock').append($("<span>").attr('class', 'score').html("Losses: " + losses));
  score.append(lossDiv);
  var drawDiv = $("<div>").attr('class', 'col-lg-4 scoreBlock').append($("<span>").attr('class', 'score').html("Draws: " + draws));
  score.append(drawDiv);
  $("#score").append(score);
}

function url_query( query ) {
    query = query.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var expr = "[\\?&]"+query+"=([^&#]*)";
    var regex = new RegExp( expr );
    var results = regex.exec( window.location.href );
    if ( results !== null ) {
        return results[1];
    } else {
        return false;
    }
}

function chooseOption() {
  currentGame[currentPlayer] = $(this).attr('id');
  renderGame();
  database.ref(gameId).set(currentGame);
}
