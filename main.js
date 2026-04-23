/////////////////////////////////////// brush water function
// this is the code that 'dries' the user's brush over time. this was implemented to add a certain amount of
// friction to the interaction. while this friction adds additional effort, through the repeated need to 'dip'
// the brush, it also adds a certain layer of colour (or rather alpha) indeterminacy. It means there is
// additional variation based on users' choices of how ofter to 'dip' the brush, and how many times to
// paint over the same area.

// this number represents how much 'water' is on the brush by default : for reference, dipping brush in
// cup sets this to 1.0
let waterAmount = 0.5;
// this is the rate at which the brush dries as the user paints : it's pretty fast currently, but that helps
// emphasise the interaction
let dryAmount = 0.005;
// toDo : update this to the first colour of the palette
let currentColour = "rgb(255, 255, 255)";

// toDo : use loop to assign event listeners
document.getElementById("palette01").addEventListener("click", addColour);
document.getElementById("palette02").addEventListener("click", addColour);
document.getElementById("palette03").addEventListener("click", addColour);
document.getElementById("palette04").addEventListener("click", addColour);
document.getElementById("palette05").addEventListener("click", addColour);
document.getElementById("palette06").addEventListener("click", addColour);
document.getElementById("palette07").addEventListener("click", addColour);
document.getElementById("palette08").addEventListener("click", addColour);


function addColour(e){
  let buttonClicked = e.target;
  // rather than store colour data as a data-* attribute, just check its current background colour
  let backgroundColour = getComputedStyle(buttonClicked).backgroundColor;
  currentColour = backgroundColour;
  // make sure we add in alpha value based on waterAmount
  let newAlphaColour = rgbaFromRGBString(backgroundColour, waterAmount);
  setBrushColour(newAlphaColour);
}

// this will run during the drawing loop defined in konvaSetup.js
function dryingBrush(){
  waterAmount = waterAmount - dryAmount;
  let newColour = rgbaFromRGBString(currentColour, waterAmount);
  setBrushColour(newColour);
}

document.getElementById("waterCupMouth").addEventListener("click", () => {
  waterAmount = 1;
});

/* expects an rgb() string and a=n alpha value as a number */
function rgbaFromRGBString(rgbString, newAlpha){
  /* first we need to get the number values from our string */
  /* the below will return an array with our seperate r,g,b values */
  let colours = rgbString.match(/\d+/g);
  /* then we need to turn this, plus our alpha number into an rgba() string */
  /* below uses template literals to make short script */
  /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals */
  let newRGBAString = `rgba(${colours[0]}, ${colours[1]}, ${colours[2]}, ${newAlpha})`;
  /* finally return this new string */
  return newRGBAString;
}

function setBrushColour(newColour){
  ctx.strokeStyle = newColour;
}


/////////////////////////////////////// undo / redo

/* we created our canvas in konvaSetup.js and called it canvas */
// store single state history
let prevState;

// store multiple state history
let undoStack = [];
let redoStack = [];
let currentState = canvas.toDataURL();

document.getElementById("undoBtn").addEventListener("click", () => {
   //drawDataURLToCanvas(prevState);
  undoState();
});

document.getElementById("redoBtn").addEventListener("click", () => {
  redoState();
});

// this is an example of user controlled save state
document.getElementById("saveStateBtn").addEventListener("click", () => {
  prevState = canvas.toDataURL();
});

document.getElementById("saveFileBtn").addEventListener("click", () => {
  let canvasCapture = canvas.toDataURL();
  /* remember to comment or delete below console if using in production */
  console.log(canvasCapture);
  // create a link element
  const downloadLink = document.createElement("a");
  // set image data as href
  downloadLink.href = canvasCapture;
  // set filename
  downloadLink.download = "myImage.png";
  // simulated the click
  downloadLink.click();
  // remove link once we're done
  downloadLink.remove();
});

// takes in an img url and puts it on the canvas
function drawDataURLToCanvas(imgDataURL){
  /* create img element */
  let img2Draw = new Image();
  /* create an event listener to trigger on src loading */
  img2Draw.addEventListener("load", function drawOnLoad(){
    /* clear what's already on the canvas */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* draw the img using the canvas context - ctx is created in konvaSetup.js */
    /* the two 0s are the x and y position */
    ctx.drawImage(img2Draw, 0, 0);
    /* we have to then redraw the konva layer manually */
    layer.batchDraw();
    /* stop listening for the load event on this element */
    img2Draw.removeEventListener("load", drawOnLoad);
    /* get rid of this element */
    img2Draw.remove();
  });
  /* give the element a source, kicking off the event listener */
  img2Draw.src = imgDataURL;  
}

// this triggers when user finishes drawing a line
function saveNewState(){
  // send old current state to end of undo array
  undoStack.push(currentState);
  // update current state
  currentState = canvas.toDataURL();
  // reset redo stack
  redoStack = [];
}

function undoState(){
  //  check if undo available
  if (undoStack.length > 0){
    // send old current state to end of redo array
    redoStack.push(currentState);
    // set canvas to last state in the stack
    let undoURL = undoStack.pop();
    drawDataURLToCanvas(undoURL);
    // as well as current state
    currentState = undoURL;
  }
}

function redoState(){
  //  check if redo available
  if (redoStack.length > 0){
    // send old current state to end of undo array
    undoStack.push(currentState);
    // set canvas to last state in the stack
    let redoURL = redoStack.pop();
    drawDataURLToCanvas(redoURL);
    // as well as current state
    currentState = redoURL;
  }
}
