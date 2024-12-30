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

  public isPublishingAudio = false;
  public isPublishingVideo = false;

  private isVideoAvailable = false;
  private isAudioAvailable = false;

  constructor(device: Device, connector: Connector,localVideoRef: React.RefObject<HTMLVideoElement>) {
    this.device = device;
    this.localVideoRef = localVideoRef;
    this.connector = connector;

  }

  async stopPublishing() {
    this.producers.forEach((producer) => {
      producer.pause();
      producer.close();
    });
    this.producers.clear();
    if (this.producerTransport) {
      this.producerTransport.close();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
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
        throw MediasoupError.deviceNotSupported([...unavailableDevices]);
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

  // resumeProducer(kind: any) {
  //   const producer = this.producers.get(kind);
  //   if (producer) {
  //     producer.resume();

  //     const eventName = kind === 'video' ? 'myVideoOn' : 'myAudioOn';
  //     this.connector.sendRequest(eventName, {});
  //   } else {
  //     console.error('resumeProducer() | producer NOT FOUND');
  //   }
  // }

  
  resumeProducer(kind: string) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.resume();
      // if (kind === "audio") this.isPublishingAudio = true;
      // else if (kind === "video") this.isPublishingVideo = true;

      const eventName = kind === 'video' ? 'myVideoOn' : 'myAudioOn';
      this.connector.sendRequest(eventName, {});
    } else {
      console.error(`resumeProducer() | producer for ${kind} not found`);
    }
  }

  // pauseProducer(kind: any) {
  //   const producer = this.producers.get(kind);
  //   if (producer) {
  //     producer.pause();

  //     const eventName = kind === 'video' ? 'myVideoOff' : 'myAudioOff';
  //     this.connector.sendRequest(eventName, {});
  //   } else {
  //     console.error('pauseProducer() | producer NOT FOUND');
  //   }
  // }


  pauseProducer(kind: string) {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.pause();
      // if (kind === "audio") this.isPublishingAudio = false;
      // else if (kind === "video") this.isPublishingVideo = false;

      const eventName = kind === 'video' ? 'myVideoOff' : 'myAudioOff';
      this.connector.sendRequest(eventName, {});
    } else {
      console.error(`pauseProducer() | producer for ${kind} not found`);
    }
  }





  
  async startPublishingAudio() {
    if (this.isPublishingAudio) return;

    if (!this.isAudioAvailable) {
      console.error('The following devices are not available: audio');
      throw MediasoupError.deviceNotSupported(['audio']);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.localStream = stream;
      this.isPublishingAudio = true;

      if (!this.producerTransport) {
        // Initialize producerTransport if not already done
        await this.createProducerTransport();
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const trackParam = { track: audioTrack };
        const producer = await this.producerTransport.produce(trackParam);
        this.producers.set("audio", producer);
      }

      this.connector.sendRequest('myAudioOn', {});
    } catch (error) {
      console.error('Error publishing audio:', error);
      this.isPublishingAudio = false;
    }
  }


  async startPublishingVideo() {
    if (this.isPublishingVideo) return;

    if (!this.isVideoAvailable) {
      console.error('The following devices are not available: audio');
      throw MediasoupError.deviceNotSupported(['audio']);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.localStream = stream;
      this.isPublishingVideo = true;

      if (!this.producerTransport) {
        // Initialize producerTransport if not already done
        await this.createProducerTransport();
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const trackParam = { track: videoTrack };
        const producer = await this.producerTransport.produce(trackParam);
        this.producers.set("video", producer);
      }

      this.connector.sendRequest('myVideoOn', {});
    } catch (error) {
      console.error('Error publishing video:', error);
      this.isPublishingVideo = false;
    }
  }

  public async enumerateDevices() {
    console.log('--- enumerateDevice --');
    for (const media of await navigator.mediaDevices.enumerateDevices()) {
      if (media.kind === 'videoinput') {
        this.isVideoAvailable = true;
      }
      if (media.kind === 'audioinput') {
        this.isAudioAvailable = true;
      }
    }
  }


  private async createProducerTransport() {
    const params = await this.connector.sendRequest('createProducerTransport', {});
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

};