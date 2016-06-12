import { chai } from "meteor/practicalmeteor:chai";
import emptyDatabase from "./test-helpers.js";

describe("chatter api methods", function () {
  let chatterUser;
  let room;
  let meteorUser;
  const assert = chai.assert;

  before(function() {
    meteorUser = Meteor.users.findOne("id_of_user_one");

    const userId = new Chatter.User({
      userId: meteorUser._id,
      userType: "admin",
      nickname: "test nickname"
    }).save();

    chatterUser = Chatter.User.findOne(userId);

    const roomId = new Chatter.Room({
      name: "test room",
      description: "test room description"
    }).save();
    room = Chatter.Room.findOne(roomId);
  });

  after(function() {
    emptyDatabase();
  });

  it("chatter user is added", function() {
    assert.equal(chatterUser.userId, meteorUser._id);
  });

  it("chatter room is added", function() {
    assert.equal(room.name, "test room");
    assert.equal(room.description, "test room description");
  });

  it("chatter user is added to chatter room", function() {
    new Chatter.UserRoom({
      userId: chatterUser._id,
      roomId: room._id
    }).save();
    const roomUsers = Chatter.UserRoom.find({userId: chatterUser._id, roomId: room._id}).fetch();
    assert.lengthOf(roomUsers, 1);
  });

});
