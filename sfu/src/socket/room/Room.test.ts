import { setupRoom, Room } from "./room";
import { config } from "@sfu/core/config";
import { getNextWorker, createWorkers } from "../worker/worker";
import { MemberSFU } from "../types";

jest.mock("mediasoup");
jest.mock("../../core/config", () => ({
  config: {
    mediasoup: {
      router: {
        mediaCodecs: [
          {
            kind: "audio",
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2
          },
          {
            kind: "video",
            mimeType: "video/VP8",
            clockRate: 90000,
            parameters: {
              "x-google-start-bitrate": 1000
            }
          }
        ]
      }
    }
  }
}));
jest.mock("../worker/worker", () => ({
  createWorkers: jest.fn(),
  getNextWorker: jest.fn()
}));

describe("Room and setupRoom", () => {
  let mockRouter: any;
  let mockWorker: any;

  beforeAll(async () => {
    // Ensure workers are created before tests
    await createWorkers();
  });

  beforeEach(() => {
    // Mock MediaSoup Router and Worker
    mockRouter = {
      observer: { on: jest.fn() },
      close: jest.fn()
    };
    mockWorker = {
      createRouter: jest.fn().mockResolvedValue(mockRouter)
    };
    (getNextWorker as jest.Mock).mockReturnValue(mockWorker);
    Room.rooms = new Map();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("setupRoom creates a Room and associates a router", async () => {
    const { roomId, room } = await setupRoom("Test Room", "http://test.url", "host@test.com", "password");

    expect(room).toBeInstanceOf(Room);
    expect(room.name).toBe("Test Room");
    expect(room.url).toBe("http://test.url");
    expect(room.hostEmail).toBe("host@test.com");
    expect(room.password).toBe("password");
    expect(room.router).toBe(mockRouter);
    expect(mockWorker.createRouter).toHaveBeenCalledWith({
      mediaCodecs: config.mediasoup.router.mediaCodecs
    });
    expect(mockRouter.observer.on).toHaveBeenCalledWith("close", expect.any(Function));
    expect(mockRouter.observer.on).toHaveBeenCalledWith("newtransport", expect.any(Function));
  });

  test("Room static methods handle rooms correctly", () => {
    const room1 = new Room({ name: "Room1", url: "http://url1", hostEmail: "host1@test.com", password: "pass1" });
    const room2 = new Room({ name: "Room2", url: "http://url2", hostEmail: "host2@test.com", password: "pass2" });

    Room.addRoom(room1);
    Room.addRoom(room2);

    expect(Room.getRoomById(room1.id)).toBe(room1);
    expect(Room.getRoomById(room2.id)).toBe(room2);

    Room.deleteRoom(room1.id);
    expect(Room.getRoomById(room1.id)).toBeUndefined();
    expect(Room.getRoomById(room2.id)).toBe(room2);
  });

  test("Room consumer transport management", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    room.addConsumerTransport("client1", { id: "transport1" } as any);
    expect(room.getConsumerTrasnport("client1")?.id).toBe("transport1");

    room.removeConsumerTransport("client1");
    expect(room.getConsumerTrasnport("client1")).toBeUndefined();
  });

  test("Room consumer management", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    // Add and retrieve a video consumer set
    const videoConsumerSet = new Map<string, any>();
    videoConsumerSet.set("remote1", { id: "consumer1" });
    room.addConsumerSet("client1", "video", videoConsumerSet);

    const retrievedSet = room.getConsumerSet("client1", "video");
    expect(retrievedSet?.get("remote1")?.id).toBe("consumer1");

    // Add individual consumer and retrieve it
    const consumer = { id: "consumer2" } as any;
    room.addConsumer("client1", "remote2", consumer, "video");
    expect(room.getConsumer("client1", "remote2", "video")?.id).toBe("consumer2");

    // Remove a consumer and verify
    room.removeConsumer("client1", "remote2", "video");
    expect(room.getConsumer("client1", "remote2", "video")).toBeUndefined();
  });

  test("Room producer management", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    // Add and retrieve producers
    const videoProducer = { id: "videoProducer1" } as any;
    const audioProducer = { id: "audioProducer1" } as any;

    room.addProducer("client1", videoProducer, "video");
    room.addProducer("client1", audioProducer, "audio");

    expect(room.getProducer("client1", "video")?.id).toBe("videoProducer1");
    expect(room.getProducer("client1", "audio")?.id).toBe("audioProducer1");

    // Remove producers and verify
    room.removeProducer("client1", "video");
    expect(room.getProducer("client1", "video")).toBeUndefined();

    room.removeProducer("client1", "audio");
    expect(room.getProducer("client1", "audio")).toBeUndefined();
  });

  test("Room handles invalid producer kind", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    const invalidProducer = { id: "invalidProducer" } as any;

    // Try adding invalid producer kind
    expect(() => room.addProducer("client1", invalidProducer, "invalidKind" as any)).not.toThrow();

    // Ensure producer isn't added
    expect(room.getProducer("client1", "invalidKind" as any)).toBeNull();
  });

  test("Room producer transport management", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    const transport = { id: "transport1" } as any;

    room.addProducerTransport("client1", transport);
    expect(room.getProducerTransport("client1")?.id).toBe("transport1");

    room.removeProducerTransport("client1");
    expect(room.getProducerTransport("client1")).toBeUndefined();
  });

  test("Room member management", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password",
      maxParticipants: 2
    });

    const member1 = { socketId: "member1", username: "John Doe", role: "host" } as MemberSFU;
    const member2 = { socketId: "member2", username: "Jane Doe", role: "participant" } as MemberSFU;

    // Add members
    room.addMember(member1);
    room.addMember(member2);

    expect(room.getMember("member1")?.username).toBe("John Doe");
    expect(room.getMember("member2")?.username).toBe("Jane Doe");

    // Ensure room capacity is respected
    const member3 = { socketId: "member3", username: "Extra Member", role: "participant" } as MemberSFU;
    expect(() => room.addMember(member3)).toThrow("Room is full");

    // Remove members
    room.removeMember("member1");
    expect(room.getMember("member1")).toBeUndefined();
    expect(room.getMember("member2")?.username).toBe("Jane Doe");
  });

  test("Room retrieves all remote producer IDs", () => {
    const room = new Room({
      name: "Test Room",
      url: "http://test.url",
      hostEmail: "host@test.com",
      password: "password"
    });

    const videoProducer1 = { id: "videoProducer1" } as any;
    const videoProducer2 = { id: "videoProducer2" } as any;

    room.addProducer("client1", videoProducer1, "video");
    room.addProducer("client2", videoProducer2, "video");

    // Ensure only remote producers are returned
    const remoteVideoProducers = room.getAllRemoteProducerIds("client1", "video");
    expect(remoteVideoProducers).toContain("client2");
    expect(remoteVideoProducers).not.toContain("client1");
  });

  test("Room static methods for room registry", () => {
    const room1 = new Room({ name: "Room1", url: "http://url1", hostEmail: "host1@test.com", password: "pass1" });
    const room2 = new Room({ name: "Room2", url: "http://url2", hostEmail: "host2@test.com", password: "pass2" });

    Room.addRoom(room1);
    Room.addRoom(room2);

    expect(Room.rooms.size).toBe(2);
    expect(Room.getRoomById(room1.id)).toBe(room1);
    expect(Room.getRoomById(room2.id)).toBe(room2);

    Room.deleteRoom(room1.id);
    expect(Room.rooms.size).toBe(1);
    expect(Room.getRoomById(room1.id)).toBeUndefined();
  });
});
