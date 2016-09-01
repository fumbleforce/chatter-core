import { chai } from "meteor/practicalmeteor:chai";
import emptyDatabase from "./test-helpers.js";

describe("chatter models", function() {
  const assert = chai.assert;

  after(function() {
    emptyDatabase();
  });

  describe("chatter message model", function() {

    //initilizing test message
    const attributes = {
      message: "test message",
      userId: "testUserId",
      roomId: "testRoomId"
    };

    let messageId;
    let message;

    before(function(done) {
      messageId = new Chatter.Message(attributes).save();
      message = Chatter.Message.findOne(messageId);
      done();
    });

    it("message is inserted with correct attributes", function() {
      assert.equal(message.userId, attributes.userId);
      assert.equal(message.roomId, attributes.roomId);
      assert.equal(message.message, attributes.message);
    });


    it("message returns the correct timeAgo when calling getTimeAgo()", function() {
      assert.equal(message.getTimeAgo(), "a few seconds ago");
    });

  });

  describe("chatter room model", function() {

    const attributes = {
      name: "test room",
      description: "test description",
      createdBy: "test creator"
    };

    let then;
    let roomId;
    let room;

    before(function() {
      then = new Date();
      roomId = new Chatter.Room(attributes).save();
      room = Chatter.Room.findOne(roomId);
    });

    it("room is inserted with correct attributes", function() {
      assert.equal(room.name, attributes.name);
      assert.equal(room.description, attributes.description);
      assert.equal(room.createdBy, attributes.createdBy);
    });

    it("room is inserted with correct defaults", function() {
      const now = new Date();
      assert.equal(now.getTime() - room.lastActive.getTime() < 20000, true);
    });

  });


  describe("chatter userroom model", function() {

    //initilizing test user
    const attributes = {
      userId: "test user id",
      roomId: "testRoomId"
    };

    let userRoomId;
    let userRoom;

    before(function() {
      userRoomId = new Chatter.UserRoom(attributes).save();
      userRoom = Chatter.UserRoom.findOne(userRoomId);
    });

    it("User Room is inserted with correct attributes", function() {
      assert.equal(userRoom.userId, attributes.userId);
      assert.equal(userRoom.roomId, attributes.roomId);
      assert.equal(userRoom.archived, false);

    });

    it("User Room is inserted with correct defaults", function() {
      assert.equal(userRoom.unreadMsgCount, 0);
    });

    Chatter.UserRoom.remove({_id: userRoomId});
  });
});
