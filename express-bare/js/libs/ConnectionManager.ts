import { trace } from "../utils/Utils";


export class ConnectionManager {

  localPeerConnection: RTCPeerConnection;
  remotePeerConnection: RTCPeerConnection;

  offerOptions;


  constructor() {
    this.offerOptions = {
      offerToReceiveVideo: 1,
    };
  }


  startConnection(servers, mediaTracks: MediaStreamTrack[], gotRemoteStreamCallback: EventListener) {
    this.localPeerConnection = new RTCPeerConnection(servers);
    trace('Created local peer connection object localPeerConnection.');

    this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
    this.localPeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange);

    this.remotePeerConnection = new RTCPeerConnection(servers);
    trace('Created remote peer connection object remotePeerConnection.');

    this.remotePeerConnection.addEventListener('icecandidate', this.handleConnection);
    this.remotePeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange);
    this.remotePeerConnection.addEventListener('addstream', gotRemoteStreamCallback);

    // Add local stream to connection and create offer to connect.
    for (const mediaTrack of mediaTracks){
      this.localPeerConnection.addTrack(mediaTrack);
    }
    trace('Added local stream to localPeerConnection.');

    trace('localPeerConnection createOffer start.');
    this.localPeerConnection.createOffer(this.offerOptions)
      .then(this.createdOffer).catch(this.setSessionDescriptionError);
  }


  closeConnection() {
    this.localPeerConnection.close();
    this.remotePeerConnection.close();
    //this.localPeerConnection = null;
    //this.remotePeerConnection = null;
  }


  // Logs offer creation and sets peer connection session descriptions.
  createdOffer(description) {
    trace(`Offer from localPeerConnection:\n${description.sdp}`);

    trace('localPeerConnection setLocalDescription start.');
    this.localPeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.localPeerConnection);
      }).catch(this.setSessionDescriptionError);

    trace('remotePeerConnection setRemoteDescription start.');
    this.remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.remotePeerConnection);
      }).catch(this.setSessionDescriptionError);

    trace('remotePeerConnection createAnswer start.');
    this.remotePeerConnection.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError);
  }


  // Logs answer to offer creation and sets peer connection session descriptions.
  createdAnswer(description) {
    trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

    trace('remotePeerConnection setLocalDescription start.');
    this.remotePeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.remotePeerConnection);
      }).catch(this.setSessionDescriptionError);

    trace('localPeerConnection setRemoteDescription start.');
    this.localPeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.localPeerConnection);
      }).catch(this.setSessionDescriptionError);
  }


  setDescriptionSuccess(peerConnection, functionName) {
    const peerName = this.getPeerName(peerConnection);
    trace(`${peerName} ${functionName} complete.`);
  }

  // Logs success when localDescription is set.
  setLocalDescriptionSuccess(peerConnection) {
    this.setDescriptionSuccess(peerConnection, 'setLocalDescription');
  }

  // Logs success when remoteDescription is set.
  setRemoteDescriptionSuccess(peerConnection) {
    this.setDescriptionSuccess(peerConnection, 'setRemoteDescription');
  }


  // Logs error when setting session description fails.
  setSessionDescriptionError(error: Error) {
    trace(`Failed to create session description: ${error.toString()}.`);
  }


  // Connects with new peer candidate.
  handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          this.handleConnectionSuccess(peerConnection);
        }).catch((error) => {
          this.handleConnectionFailure(peerConnection, error);
        });

      trace(`${this.getPeerName(peerConnection)} ICE candidate:\n` +
        `${event.candidate.candidate}.`);
    }
  }


  // Logs that the connection succeeded.
  handleConnectionSuccess(peerConnection) {
    trace(`${this.getPeerName(peerConnection)} addIceCandidate success.`);
  };


  // Logs that the connection failed.
  handleConnectionFailure(peerConnection, error) {
    trace(`${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
      `${error.toString()}.`);
  }


  // Logs changes to the connection state.
  handleConnectionChange(event) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    trace(`${this.getPeerName(peerConnection)} ICE state: ` +
      `${peerConnection.iceConnectionState}.`);
  }


  /* ---------------------------- Helper Functions ---------------------------- */
  // Gets the "other" peer connection.
  getOtherPeer(peerConnection: RTCPeerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      this.remotePeerConnection : this.localPeerConnection;
  }


  // Gets the name of a certain peer connection.
  getPeerName(peerConnection: RTCPeerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      'localPeerConnection' : 'remotePeerConnection';
  }
}