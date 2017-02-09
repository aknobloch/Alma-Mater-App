//===============================================
// Example 14.1
// JavaScript source: index.js
//===============================================

//Create the media object that will be the focus of our efforts
//in this application
var theMedia;
//The application sets up a timer so the screen can be regularly
//updated during playback
var theTimer;
var firstRun;

// store track locations
var trackNames = new Array(4);
trackNames[0] = "instrumental.mp3";
trackNames[1] = "vocalLow.mp3";
trackNames[2] = "vocalHigh.mp3";
trackNames[3] = "vocalOnly.mp3";

// hold lyrics
var lyricQueue;
var previousLyric;
var currentLyric;
var nextLyric;

//Some text strings used by the app
var alertTitle = "Media";
var alertBtn = "Continue";

function shouldAdvanceLyrics(timeStamp)
{
	
	switch(timeStamp)
	{
		case 10:
		case 15:
		case 19:
		case 23:
		case 27:
		case 31:
		case 35:
		case 40:
		case 44:
		case 52:
		case 60:
		case 67:
		case 76:
			return true;
		default:
			return false;
	}
	
}

function resetProgressLabel()
{
	var positionLabel = document.getElementById("positionLabel");
	positionLabel.innerHTML = "Position: - / - seconds"
}

function resetLyrics()
{
	previousLyric.innerHTML = "";
	currentLyric.innerHTML = "";
	nextLyric.innerHTML = "";
}

function initializeLyricQueue()
{
	// make sure it's empty
	lyricQueue = [];
	
	lyricQueue.push("We have gained wisdom and honor");
	lyricQueue.push("From our home of green and gray");
	lyricQueue.push("We will go forth and remember");
	lyricQueue.push("All we've learned along the way");
	lyricQueue.push("And with knowledge and compassion");
	lyricQueue.push("We will build communities");
	lyricQueue.push("Leading by example");
	lyricQueue.push("And with dignity");
	lyricQueue.push("Georgia Gwinnett, we'll never forget");
	lyricQueue.push("How we have grown, and those that we've met");
	lyricQueue.push("Georgia Gwinnett, with love and respect");
	lyricQueue.push("Our alma mater, Georgia Gwinnett");
	lyricQueue.push("Our alma mater, Georgia Gwinnett");
}

function advanceLyrics()
{
	previousLyric.innerHTML = currentLyric.innerHTML;
	currentLyric.innerHTML = nextLyric.innerHTML;
	
	var nextLyricInQueue = lyricQueue.shift();
	if(nextLyricInQueue == null)
	{
		nextLyric.innerHTML = "";
	}
	else
	{
		nextLyric.innerHTML = nextLyricInQueue;
	}
}

function onBodyLoad() 
{
	//Set the Cordova deviceready event listener, so we'll know
	//when Cordova is ready
	document.addEventListener("deviceready", onDeviceReady, false);
	previousLyric = document.getElementById("previousLyric");
	currentLyric = document.getElementById("currentLyric");
	nextLyric = document.getElementById("nextLyric");
}

function onDeviceReady() 
{

	//Initialize the media object with information about the local file
	//The user can switch this to the remote file using the radio buttons
	//on the page
	initMediaObject(0);
	initializeLyricQueue();
}

function initMediaObject(chosenTrack) 
{
	var theFile;
	//Build the local file path the application will use to access the
	//media file. First get the current page path
	var thePath = window.location.pathname;

	//whack off the index.html at the end
	thePath = thePath.substr(thePath, thePath.length - 10) + "res/";

	//Build a file path using what you have so far
	theFile = 'file://' + thePath + trackNames[chosenTrack];

	//If we have a timer active, then we're playing something,
	//better kill it before we do anything else
	if (theTimer) 
	{
		//Kill the current play
		doStop();
	}

	//Do we have an existing media object?
	if (theMedia) 
	{
		//then release the OS resources being used by it
		theMedia.release();
		//Then kill it
		theMedia = null;
	}

	//Create the media object we need to do everything we need here
	theMedia = new Media(theFile, mediaSuccess, mediaError, mediaStatus);

	//Boolean variable that is used to control initial setup
	//of the page after play begins
	firstRun = true;

}

function mediaSuccess() 
{
  //Executed when the media file is finished playing
  
  //Kill the timer we were using to update the page
  killTimer();

  updateUI();
}

function mediaError(errObj) 
{
	
  console.error(JSON.stringify(errObj));
  //Kill the timer we were using to update the page
  killTimer();
  //Let the user know what happened
  var errStr;
  //Had to add this because some of the error conditions I encountered
  //did not provide an message value
  if (errObj.message.length > 0) 
  {
    errStr = errObj.message + " (Code: " + errObj.code + ")";
  } 
  else 
  {
    errStr = "Error code: " + errObj.code + " (No error message provided by the Media API)";
  }
  console.error(errStr);
  navigator.notification.alert(errStr, null, "Media Error", alertBtn);
}

function mediaStatus(statusCode) 
{
	
  var theStatus;
  switch (statusCode) 
  {
    case Media.MEDIA_NONE:
      theStatus = "None";
      break;
    case Media.MEDIA_STARTING:
      theStatus = "Starting";
      break;
    case Media.MEDIA_RUNNING:
      theStatus = "Running";
      break;
    case Media.MEDIA_PAUSED:
      theStatus = "Paused";
      break;
    case Media.MEDIA_STOPPED:
      theStatus = "Stopped";
      break;
    default:
      theStatus = "Unknown";
  }
}

function doPlay() 
{
  if (!theTimer) 
  {
	// this should already be ready to go, but who knows...
	resetLyrics();
	initializeLyricQueue();
	
	advanceLyrics();
    //Start the media file playing
    theMedia.play();
    //fire off a timer to update the UI every second as it plays
    theTimer = setInterval(updateUI, 1000);
  } 
  else 
  {
    navigator.notification.alert("Media file already playing", null, alertTitle, alertBtn);
  }
}

function doPause()
{
  if (theTimer) 
  {
    //Kill the timer we were using to update the page
    killTimer();
    //Pause media play
    theMedia.pause();
  } 
  else 
  {
    navigator.notification.alert("No media file playing", null, alertTitle, alertBtn);
  }
}

function doStop() 
{
  if (theTimer) 
  {
    //Kill the timer we have running
    killTimer();
    //Then stop playing the audio clip
    theMedia.stop();
	
	// reset lyrics for next time
	resetLyrics();
	initializeLyricQueue();
	
	// reset progress label
	resetProgressLabel();
  } 
  else 
  {
    navigator.notification.alert("Can't stop, no media file playing", null, alertTitle, alertBtn);
  }
}

function killTimer() 
{
  if (theTimer) 
  {
    //Kill the timer that was being used to update the page
    window.clearInterval(theTimer);
    //Set the timer to null, so we can check its status later
    theTimer = null;
  } 
  else 
  {
    console.error('Nothing to do, no timer active');
  }
}

function updateUI() 
{
  //Figure out where we are in the file, result will be available
  //in the callback function, that's where the page gets updated
  theMedia.getCurrentPosition(getPositionSuccess, mediaError);
}

function getPositionSuccess(filePos) 
{

  var thePos;
  var theLen;
  var currentPosition;

  if (filePos > 0) 
  {
    //figure out how long the file is
    var theDur = theMedia.getDuration();
	
    //Do we know the duration?
    if (theDur > 0) 
	{
      //Round the length to the previous integer
      theLen = Math.round(theDur);

      //If this is the first time we've updated the UI
      if (firstRun) 
	  {
        //reset the firstRun value
        firstRun = false;
      }

      //grab current position
      currentPosition = Math.floor(filePos);

      //Just in case filePos ever goes beyond file length
      //It shouldn't, but who knows...
      if (theLen > filePos) 
	  {
        //Calculate the percentage we've completed
        thePos = Math.floor((filePos / theLen) * 100);
      } 
	  else 
	  {
        //All done, go to 100%
        thePos = 100;
      }
	  
      //Update the progress bar
      $('#progress-bar').val(thePos);
	  // update read-out
	  var positionLabel = document.getElementById("positionLabel");
	  positionLabel.innerHTML = "Position: " + currentPosition + " / " + theLen + " seconds"
	  
	  if(shouldAdvanceLyrics(currentPosition))
	  {
		  advanceLyrics();
	  }
	  
    }
	else 
	{
      console.log("Could not track file length.");
    }
	
  } 
  else 
  {
	resetLyrics();
	initializeLyricQueue();
	// reset progress label
	resetProgressLabel();
    $('#progress-bar').val(0);
  }
  
  $('#progress-bar').slider('refresh');
}
