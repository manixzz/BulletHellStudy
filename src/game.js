Game = {
// Initialize and start our game

	start: function(windowResolution, browserResX, browserResY) {
		Parse.initialize("JlOjz5oMpaXICu5SA1IDmfhVcL7qdDlLdCIYPgxb", "N59TryS5e80VOpB6Xlee2DS0n9ZOLVnwDV94ync5"); // Replace this line of code with your own Parse account information in order to log data.

		//These resolutions were calculated to represent virtual screen sizes on our hardware. As a result, we hardcoded their values to simplify the rest of the code. 
		var screenSizes = new Array();
		screenSizes[0] = [614, 346];
		screenSizes[1] = [945, 532];
		screenSizes[2] = [1280, 720];
		screenSizes[3] = [1920,1080]; 

		windowResX = screenSizes[windowResolution][0];
		windowResY = screenSizes[windowResolution][1];

		Crafty.init(windowResX, windowResY); //Initialize Crafty's game window to the specified resolution. This effectively intializes the size of the HTML5 canvas to the specified resolution.

		var canvas = document.getElementById("cr-stage"); //center the game window on the screen 
		canvas.style.top = (browserResY - windowResY)/2 +"px";
		canvas.style.left = (browserResX - windowResX)/2 +"px";
		
		Crafty.scene("startScreen"); // Display the start screen
	}
}