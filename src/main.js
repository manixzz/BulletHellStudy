var typeOfScaling = "";
var windowResX, windowResY = 0;
var defaultResX = 960; //default width resolution. These are the resolutions that initial development of the game is based off of. 
var defaultResY = 540; //default height resolution. These are the resolutions that initial development of the game is based off of. 
var defaultScreenRatio = defaultResX/defaultResY;

function startGame() {
    var fullName = document.getElementById("fullName").value;
    var screenSize = document.getElementById("screenSize").value;
    var windowRes = "";
    var scalingButtons = document.getElementsByName("scalingButtons");
    var windowSizeButtons = document.getElementsByName("windowSizeButtons");
    var wx = window.innerWidth;
    var wy = window.innerHeight; 

    for (i = 0; i < scalingButtons.length; i++) {
        if(scalingButtons[i].checked) {
            typeOfScaling = scalingButtons[i].value;
        }
    }

    for (i = 0; i< windowSizeButtons.length; i++) {
        if(windowSizeButtons[i].checked) {
            windowRes = windowSizeButtons[i].value;
        }
    }

    if(!fullName.length > 0) {
        alert("Error: Name required.")
    } else {
        if(isNaN(screenSize) || screenSize.length <= 0) {
            alert("Error: Screen size value is required. Screen size must be a number in inches.")
        } else {
            if(typeOfScaling.length > 0 && windowRes.length > 0) {
                document.getElementById("main").style.display = "none"
                document.getElementById("form").style.display = "none"
                Game.start(windowRes, wx, wy);
            }
            else {
                alert("Error: Radio Buttons for both Type of Scaling and Window Resolution must be selected.")
            }
            
        }            
    }
}