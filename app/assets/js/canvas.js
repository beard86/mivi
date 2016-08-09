'use strict';
 /*jshint unused:false*/

// shim layer with setTimeout fallback

var redCanvas = document.getElementById('redCanvas');
redCanvas.height = 500;
redCanvas.width = 20;

new FallingSquares({ 
    canvas: redCanvas,
    colours: ['#de1207'],// '#1fd107','#ded107', '#e419cd'],
    size: 10,
    spacing: 2,
    maxSpeed: 2,
    minSpeed: 2,
    numberOfColumns: 1,
    numberOfSquares: 20,
    backgroundColour: '#000000',
    xOffset: 0
});
var greenCanvas = document.getElementById('greenCanvas');
greenCanvas.height = 500;
greenCanvas.width = 20;

new FallingSquares({ 
    canvas: greenCanvas,
    colours: ['#1fd107'],// '#1fd107','#ded107', '#e419cd'],
    size: 10,
    spacing: 0,
    maxSpeed: 2,
    minSpeed: 2,
    numberOfColumns: 1,
    numberOfSquares: 20,
    backgroundColour: '#000000',
    xOffset: 0
});
var blueCanvas = document.getElementById('blueCanvas');
blueCanvas.height = 500;
blueCanvas.width = 20;

new FallingSquares({ 
    canvas: blueCanvas,
    colours: ['#0000bf'],// '#1fd107','#ded107', '#e419cd'],
    size: 10,
    spacing: 0,
    maxSpeed: 2,
    minSpeed: 2,
    numberOfColumns: 1,
    numberOfSquares: 20,
    backgroundColour: '#000000',
    xOffset: 0
});
var yellowCanvas = document.getElementById('yellowCanvas');
yellowCanvas.height = 500;
yellowCanvas.width = 20;

new FallingSquares({ 
    canvas: yellowCanvas,
    colours: ['#ded107'],// '#1fd107','#ded107', '#e419cd'],
    size: 10,
    spacing: 0,
    maxSpeed: 2,
    minSpeed: 2,
    numberOfColumns: 1,
    numberOfSquares: 20,
    backgroundColour: '#000000',
    xOffset: 0
});
// Global Variables
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var screenHeight = $(window).height();
var screenWidth = $(window).width();
var shapes = {};
var shapeIndex = 0;
var score = 0;
var fallSpeed = 20;
var shapeGenerateSpeed = 3;

// Setting Canvas Dimensions
$(window).resize(function(){
        console.log('1',screenWidth/1.5);
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    if(screenWidth <= 786) {
        console.log('2',screenWidth/1.5);
        canvas.width = screenWidth/1.5;

    } else if(screenWidth <= 1024) {
        console.log('1024');
        canvas.width = screenWidth/2;
    } else {
        canvas.width = screenWidth/4;

    }
    canvas.height = screenHeight/1.375;
});
if(screenWidth <= 786) {
    console.log('2',screenWidth/1.5);
    canvas.width = screenWidth/1.5;

} else if(screenWidth <= 1024) {
    console.log('1024');
    canvas.width = screenWidth/2;
} else {
    canvas.width = screenWidth/4;

}
//canvas.height = screenHeight-(screenWidth/12);
canvas.height = screenHeight/1.375;


//Generates Snake Head
function Shape(posX, width, height) {
    this.Width = width;
    this.Height = height;
    this.Color = {
      R: Math.round(Math.random())*255,
      G: Math.round(Math.random())*255,
      B: Math.round(Math.random())*255

    }
    this.Position = {
        X: posX,
        Y: -this.Height
    };
    this.Velocity = Math.random() * fallSpeed + 5;
    this.Index = shapeIndex;

    shapes[shapeIndex] = this;
    shapeIndex++

    this.checkCollisions = function() {
      if(this.Position.Y >= screenHeight){
        delete shapes[this.Index];
      }
    }
    this.updatePosition = function() {
        this.Position.Y += this.Velocity;
    }
    this.Draw = function() {
        ctx.beginPath();
        ctx.rect(this.Position.X, this.Position.Y, this.Width, this.Height);
        ctx.fillStyle = "rgba("+this.Color.R+", "+this.Color.G+", "+this.Color.B+", 0.75)";
        ctx.fill();
    }
    this.update = function(){
        this.checkCollisions();
        this.updatePosition();
        this.Draw();
    }
}


function newGame(){
  //dude = new Dude(screenWidth/2, 30, 30);
  shapes = {};
}
function shapeGenerate(){
  new Shape(Math.random()*screenWidth,10,10);
}

function Updater() {
    ctx.clearRect(0, 0, screenWidth, screenHeight);
    for(var i in shapes){
      shapes[i].update();
    }
    //dude.update();
    // requestAnimationFrame(Updater);
}
setInterval(Updater, 100);
setInterval(shapeGenerate, shapeGenerateSpeed);