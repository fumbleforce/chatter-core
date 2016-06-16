import { chai } from "meteor/practicalmeteor:chai";
import emptyDatabase from "./test-helpers.js";

describe("chatter api methods", function () {

  const assert = chai.assert;

  afterEach(function() {
    emptyDatabase();
  });

  describe("creating methods", function() {
    let room;
    let user;

    before(function() {
      user = Meteor.users.findOne("id_of_user_one");
      const roomId = new Chatter.Room({
        name: "test room",
        description: "test room description"
      }).save();
      room = Chatter.Room.findOne(roomId);
    });

    it("chatter room is added", function() {
      assert.equal(room.name, "test room");
      assert.equal(room.description, "test room description");
    });

    it("chatter user is added to chatter room", function() {
      new Chatter.UserRoom({
        userId: user._id,
        roomId: room._id
      }).save();
      const roomUsers = Chatter.UserRoom.find({userId: user._id, roomId: room._id}).fetch();
      assert.lengthOf(roomUsers, 1);
    });
  })

  describe("destruction methods", function() {
    let room;
    let userRoom;
    let user;

    beforeEach(function() {
      user = Meteor.users.findOne("id_of_user_one");

      const roomId = new Chatter.Room({
        name: "test room",
        description: "test room description"
      }).save();
      room = Chatter.Room.findOne(roomId);


      const userRoomId = new Chatter.UserRoom({
        userId: user._id,
        roomId: room._id
      }).save();

      userRoom = Chatter.UserRoom.findOne(userRoomId);
    });

    it("chatter room is removed", function() {
      const params = {
        roomId: room._id
      };
      Chatter.removeRoom(params);
      assert.isUndefined(Chatter.Room.findOne(room._id),  "room does no longer exist");
    });

  });
});
