export enum MediasoupErrorKind {
  // Device related errors
  DeviceNotSupported = 'DEVICE_NOT_SUPPORTED',
  DeviceLoadFailed = 'DEVICE_LOAD_FAILED',
  DeviceNotInitialized = 'DEVICE_NOT_INITIALIZED',

  // Connection related errors
  ConnectionFailed = 'CONNECTION_FAILED',
  SocketConnectionFailed = 'SOCKET_CONNECTION_FAILED',
  TransportConnectionFailed = 'TRANSPORT_CONNECTION_FAILED',

  // Transport related errors
  ProducerTransportFailed = 'PRODUCER_TRANSPORT_FAILED',
  ConsumerTransportFailed = 'CONSUMER_TRANSPORT_FAILED',
  TransportClosedUnexpectedly = 'TRANSPORT_CLOSED_UNEXPECTEDLY',

  // Media related errors
  MediaPermissionDenied = 'MEDIA_PERMISSION_DENIED',
  NoMediaDevicesFound = 'NO_MEDIA_DEVICES_FOUND',
  MediaStreamFailed = 'MEDIA_STREAM_FAILED',

  // RTC Capabilities errors
  RtpCapabilitiesFailed = 'RTP_CAPABILITIES_FAILED',
  
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_IS_FULL = 'ROOM_IS_FULL',
  ROOM_IS_CLOSED = 'ROOM_IS_CLOSED',

  // Request related errors
  JOIN_REQUEST_REJECTED = 'JOIN_REQUEST_REJECTED',

  // Unknown error
  Unknown = 'UNKNOWN'
}

export class MediasoupError extends Error {
  readonly kind: MediasoupErrorKind;
  readonly context?: Record<string, unknown>;

  constructor(
    kind: MediasoupErrorKind,
    message?: string,
    context?: Record<string, unknown>
  ) {
    super(message || kind);
    this.kind = kind;
    this.context = context;
    this.name = 'MediasoupError';
  }

  static deviceLoad(error: unknown): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.DeviceLoadFailed,
      'Failed to load mediasoup device',
      { originalError: error }
    );
  }

  static deviceNotSupported(devices: string[]): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.DeviceNotSupported, 
      'Device not supported',
      { unsupportedDevices: devices }
    );
  }

  static connectionFailed(error: unknown): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.ConnectionFailed,
      'Failed to establish connection',
      { originalError: error }
    );
  }

  static mediaPermissionDenied(): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.MediaPermissionDenied,
      'User denied media permissions'
    );
  }

  static transportFailed(type: 'producer' | 'consumer', error: unknown): MediasoupError {
    const kind = type === 'producer' 
      ? MediasoupErrorKind.ProducerTransportFailed 
      : MediasoupErrorKind.ConsumerTransportFailed;
    
    return new MediasoupError(
      kind,
      `${type} transport failed`,
      { originalError: error }
    );
  }

  static roomNotFound(): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.ROOM_NOT_FOUND,
      'Room not found'
    );
  }

  static roomFull(): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.ROOM_IS_FULL,
      'Room is full'
    );
  }


  static joinRequestRejected(): MediasoupError {
    return new MediasoupError(
      MediasoupErrorKind.JOIN_REQUEST_REJECTED,
      'Join request rejected'
    );
  }

}