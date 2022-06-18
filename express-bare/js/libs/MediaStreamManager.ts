import { trace } from "../utils/Utils";

export class MediaStreamManager {

  constraints : Object;
  localVideoElement : HTMLVideoElement;
  remoteVideoElement: HTMLVideoElement;
  localStream : MediaStream;
  remoteStream: MediaStream;


  constructor(initObj) {
    this.constraints = {
      video: true,
    };
    this.localVideoElement = initObj.localVideoElement;  
    this.remoteVideoElement = initObj.remoteVideoElement;
  }


  getStream() {
    navigator.mediaDevices.getUserMedia(this.constraints)
      .then(this.onGotLocalStream)
      .catch(this.handleGetStreamError);
  }


  onGotLocalStream(mediaStream : MediaStream) {
    this.localStream = mediaStream;
    this.localVideoElement.srcObject = mediaStream;
    console.trace();
  }

  onGotRemoteStream(event) {
    const mediaStream = event.stream;
    this.remoteVideoElement.srcObject = mediaStream;
    this.remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
  }


  handleGetStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  getVideoTracks() {
    return this.localStream.getVideoTracks();
  }

  getAudioTracks() {
    return this.localStream.getAudioTracks();
  }
}