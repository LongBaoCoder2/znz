import os from "os"
import "dotenv/config.js"
import { RtpCodecCapability, WorkerLogTag } from "mediasoup/node/lib/types"

const ifaces = os.networkInterfaces()

const getLocalIp = () => {
  let localIp = '127.0.0.1'
  Object.keys(ifaces).forEach((ifname) => {
    if (!ifaces[ifname]) return;

    for (const iface of ifaces[ifname]) {
      // Ignore IPv6 and 127.0.0.1
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue
      }

      localIp = iface.address
      return;
    }
  })
  return localIp
}

export const config = {
  listenIp: '0.0.0.0',
  listenPort: process.env.PORT || 8000,
  useHttps: (process.env.USE_HTTPS && process.env.USE_HTTPS === 'true') || false,
  passphrase: process.env.PASSPHRASE,
  sslCrt: '../ssl/localhost.crt',
  sslKey: '../ssl/localhost.key',
  // sslCrt: '../ssl/cert.pem',
  // sslKey: '../ssl/key.pem',
  environment: process.env.ENVIRONMENT || "dev",
  secretKey: process.env.SECRET_KEY || "secret",
  refreshSecretKey: process.env.REFRESH_SECRET_KEY || "RefreshSecret",
  databaseString: process.env.DATABASE_URL,
  numWorkers: Object.keys(os.cpus()).length,

  mediasoup: {
    // Worker settings
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'warn',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp'
      ] as WorkerLogTag[]
    },
    // Router settings
    router: {
      mediaCodecs: [
      {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        }
      ] as RtpCodecCapability[]
    },
    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: getLocalIp() // replace by public IP address
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
      maxIncomingBitrate: 1500000,
    }
  }
} as const;