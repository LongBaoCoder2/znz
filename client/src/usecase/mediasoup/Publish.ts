import { Device, types as mediaSoupTypes } from "mediasoup-client";
import { Connector } from "./Connector";
import { MediasoupError } from "./error";


export class Publish {
  public device: Device;
  public localStream!: MediaStream;
  public producerTransport!: mediaSoupTypes.Transport;
  public localVideoRef: React.RefObject<HTMLVideoElement>;
  public connector: Connector;
  public producers: Map<string, mediaSoupTypes.Producer> = new Map();  

  constructor(device: Device, connector: Connector,localVideoRef: React.RefObject<HTMLVideoElement>) {
    this.device = device;
    this.localVideoRef = localVideoRef;
    this.connector = connector;
  }

  async publish(videoOn: boolean, micOn: boolean) {
  try {
    let isVideoAvailable = false;
    let isAudioAvailable = false;
    
    console.log('--- enumerateDevice --');
    for (const media of await navigator.mediaDevices.enumerateDevices()) {
      if (media.kind === 'videoinput') {
        isVideoAvailable = true;
      }
      if (media.kind === 'audioinput') {
        isAudioAvailable = true;
      }
    }

    if ((videoOn && !isVideoAvailable) || (micOn && !isAudioAvailable)) {
      const unavailableDevices = [];
      if (videoOn && !isVideoAvailable) unavailableDevices.push('video');
      if (micOn && !isAudioAvailable) unavailableDevices.push('audio');
      console.error('The following devices are not available: ', unavailableDevices);
      throw new Error(`The following devices are not available: ${unavailableDevices.join(', ')}`);
    }

    if (isVideoAvailable || isAudioAvailable) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoAvailable && videoOn,
        audio: isAudioAvailable && micOn,
      }).catch((error) => {
        console.error('getUserMedia error: ', error);
        throw MediasoupError.deviceLoad(error); 
      });

      if (stream) {
        this.localStream = stream;
        this.playVideo(this.localVideoRef, stream);
      }
    }

    if (!this.producerTransport) {
      console.log('--- createProducerTransport --');
      const params = await this.connector.sendRequest('createProducerTransport', { });
      this.producerTransport = this.device.createSendTransport(params);

      this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        console.log('--- producerTransport connect ---');
        this.connector.sendRequest('connectProducerTransport', {
          dtlsParameters,
        }).then(callback).catch(errback);
      });

      this.producerTransport.on('produce', async (data: { kind: any, rtpParameters: any }, callback, errback) => {
        console.log('--- producerTransport produce ---');
        try {
          const { kind, rtpParameters } = data;
          const { id } = await this.connector.sendRequest('produce', { kind, rtpParameters });
          callback({ id });
        } catch (error: any) {
          console.error('producerTransport produce error:', error);
          errback(error);
        }
      });

      this.producerTransport.on('connectionstatechange', (state) => {
        switch (state) {
          case 'connecting':
            console.log('publishing...');
            break;
          case 'connected':
            console.log('published');
            break;
          case 'failed':
            console.log('failed');
            this.producerTransport.close();
            break;
          default:
            break;
        }
      });
    }

    if (videoOn) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        if (!this.producers.has("video")) {
          const trackParam = { track: videoTrack };
          const producer = await this.producerTransport.produce(trackParam);
          this.producers.set("video", producer);
        }
      } else {
        throw new Error("Video is not available or in use");
      }
    }

    if (micOn) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        if (!this.producers.has("audio")) {
          const trackParam = { track: audioTrack };
          const producer = await this.producerTransport.produce(trackParam);
          this.producers.set("audio", producer);
        }
      } else {
        throw new Error("Audio is not available or in use");
      }
    }

  } catch (error: any) {
    console.error('publish error:', error);
    throw error;
  }
}

  private playVideo(videoRef: any, stream: any) {
    if (videoRef.current.srcObject) {
        console.warn('element ALREADY playing, so ignore');
        return;
    }
    videoRef.current.srcObject = stream;
    return videoRef.current.play();
  }

  resumeProducer(kind: any) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.resume();
    } else {
      console.error('resumeProducer() | producer NOT FOUND');
    }
  }

  pauseProducer(kind: any) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.pause();
    } else {
      console.error('pauseProducer() | producer NOT FOUND');
    }
  }
};