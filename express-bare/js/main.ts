import { ConnectionManager } from "./libs/ConnectionManager";
import { MediaStreamManager } from "./libs/MediaStreamManager";
import { trace } from "./utils/Utils";


/* ----------------------------- Initialize DOM ----------------------------- */
const localVideo : HTMLVideoElement = document.getElementById('localVideo')! as HTMLVideoElement;
const remoteVideo : HTMLVideoElement = document.getElementById('remoteVideo')! as HTMLVideoElement;

const startButton : HTMLButtonElement = document.getElementById('startButton')! as HTMLButtonElement;
const callButton : HTMLButtonElement = document.getElementById('callButton')! as HTMLButtonElement;
const hangupButton : HTMLButtonElement = document.getElementById('hangupButton')! as HTMLButtonElement;

callButton.disabled = true;
hangupButton.disabled = true;




/* --------------------------- Initialize Managers -------------------------- */
let mediaStreamManager = new MediaStreamManager({
  videoElement : localVideo,
});

let connectionManager = new ConnectionManager(); 





/* --------------------------- Register Callbacks --------------------------- */

let localPeerConnection;
let remotePeerConnection;
let startTime;


// Handles start button action: creates local MediaStream.
function startAction() {
  startButton.disabled = true;
  mediaStreamManager.getStream();
  trace('Requesting local stream.');
}


// Handles call button action: creates peer connection.
function callAction() {
  callButton.disabled = true;
  hangupButton.disabled = false;

  trace('Starting call.');
  startTime = window.performance.now();

  // Get local media stream tracks.
  const videoTracks : MediaStreamTrack[] = mediaStreamManager.getVideoTracks();
  const audioTracks : MediaStreamTrack[] = mediaStreamManager.getAudioTracks();

  if (videoTracks.length > 0) {
    trace(`Using video device: ${videoTracks[0].label}.`);
  }
  if (audioTracks.length > 0) {
    trace(`Using audio device: ${audioTracks[0].label}.`);
  }

  const servers = null;  // Allows for RTC server configuration.
  connectionManager.startConnection(
    servers, 
    [videoTracks[0], audioTracks[0]], 
    mediaStreamManager.onGotRemoteStream
  );
}


// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction() {
  connectionManager.closeConnection();
  hangupButton.disabled = true;
  callButton.disabled = false;
  trace('Ending call.');
}


// Add click event handlers for buttons.
startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

console.log('setup finished');