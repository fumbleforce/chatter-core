import emptyDatabase from "./test-helpers.js";

const callbackWrapper = function(fn) {
  return function(error, response) {
    setTimeout(() => fn(error, response));
  };
};

describe("chatter meteor methods", function() {
  let chatterUser;
  let room;
  const assert = chai.assert;

  const roomAttributes = {
    name: "test room",
    description: "test description"
  };


  before(function() {
    const meteorUser = Meteor.users.findOne();
    const userId = new Chatter.User({
      userId: meteorUser._id,
      userType: "admin"
    }).save();

    const roomId =  new Chatter.Room({name: "test_room" }).save();

    chatterUser = Chatter.User.findOne(userId);
    room = Chatter.Room.findOne(roomId)

    new Chatter.UserRoom({userId: chatterUser._id, roomId: roomId }).save();

  });

  after(function() {
    emptyDatabase();
  });

  describe("user.check method", function() {
    before(function() {
      stubs.create("userId", Meteor, "userId");
    });

    it("user.check return false when user does not exist", function(done) {
      // Creating stub for Meteor.userId() that return id from non-chatter user
      stubs.userId.returns("meteor_unknown_id");

      Meteor.call("user.check", callbackWrapper((error, response) => {
        assert.isUndefined(error);
        assert.equal(response, false);
        done();
      }));
    });

    it("user.check returns true when user exists", function() {
      // Creating stub for Meteor.userId() that return id from chatter user
      stubs.userId.returns("meteor_user_one_id");

      Meteor.call("user.check", callbackWrapper((error, response) => {
        assert.isUndefined(error);
        assert.equal(response, true);
        done();
      }));
    });
  });

  describe("message.send method", function() {

    it("message.send throws exception when parameters are missing", function(done) {
      const params = {};
      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("message.send throws an error when he message text is too long", function() {
      const longMessage = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";
      const params = {};
      params.roomId = room._id;
      params.message = longMessage;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "validation-error");
        done();
      }));
    });

    it("message.send throws exception when parameters are wrong type", function(done) {
      const params = {};
      params.roomId = room._id;
      params.message = 123123;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.errorType, "Match.Error");
        done();
      }));
    });

    it("message.send throws exception when message text is empty", function(done) {
      const params = {};
      params.message = "";
      params.roomId = room._id;

      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "validation-error");
        done();
      }));
    });

    it("message.send throws error when user is not part of room ", function(done) {
      const params = {};
      params.roomId = room._id;
      params.message = "test message";
      Chatter.UserRoom.remove({userId: chatterUser._id, roomId: room._id });
      Meteor.call("message.send", params, callbackWrapper((error, response) => {
        assert.isUndefined(response);
        assert.equal(error.error, "user-not-in-room");
        done();
      }));
    });
  });

  describe("room methods", function() {

    describe("room.create", function() {
      it("throws an error when required parameters are missing", function(done) {
        const params = {};

        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("return roomId when parameters are correct", function(done) {
        const params = roomAttributes;

        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.isString(response);
          done();
        }));
      });

      it("throws a validation error when name is empty string", function(done) {
        const params = {
          name: "",
          description: "test description"
        };

        Meteor.call("room.create", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "validation-error");
          done();
        }));
      });
    });

    describe("room.archive", function() {

      it("throws an error when params are not right type", function(done) {
        const params = {
          roomId: 124324324,
          archived: false
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("throws an error when params are missing", function(done) {
        const params = {
          roomId: "124324324"
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done();
        }));
      });

      it("throws an error when roomId does not exist", function(done) {
        const params = {
          roomId: "non-existing-room",
          archived: true
        };

        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "non-existing-room");
          done();
        }));
      });

      it("room is built with archived set to default", function() {
        assert.equal(room.archived, false);
      });

      it("returns true after succesfully calling method with true parameter", function(done) {
        const params = {
          archived: true,
          roomId: room._id
        };
        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, true);
          done();
        }));
      });

      it("actually changed archived status to true", function() {
        assert.equal(Chatter.Room.findOne(room._id).archived, true);
      });

      it("returns false after succesfully calling method with false parameter", function(done) {
        const params = {
          archived: false,
          roomId: room._id
        };
        Meteor.call("room.archive", params, callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, false);
          done();
        }));
      });

      it("actually changed archived status to true", function() {
        assert.equal(Chatter.Room.findOne(room._id).archived, false);
      });
    });
  });

  describe("userRoom methods", function() {

    describe("room.join method", function() {

      describe("when parameters are missing or wrong", function() {

        it("returns exception when parameters are missing ", function(done) {
          const params = {};
          Meteor.call("room.join", params, callbackWrapper((error, response) => {
              assert.isUndefined(response);
              assert.equal(error.errorType, "Match.Error");
          }));

          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.errorType, "Match.Error");
            done();
          }));
        });

        it("returns 'room does not exist' error when roomId does not exist", function(done) {
          const params = {};
          params.roomId = "non existent roomId";
          params.invitees = [chatterUser._id];

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.error, "non-existing-room");
            done();
          }));
        });

        it("returns 'user does not exist' error when userId does not exist", function(done) {
          const params = {};
          params.invitees = ["non existent userId"];
          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(response);
            assert.equal(error.error, "non-existing-users");
            done();
          }));
        });
      });

      describe("when no parameters are missing or wrong", function() {

        it("creates a userRoom instance", function(done) {
          const params = {};
          params.invitees = [chatterUser._id];
          params.roomId = room._id;

          Meteor.call("room.join", params, callbackWrapper((error, response) => {
            assert.isUndefined(error);
            assert.isString(response);
            done();
          }));
        });
      });
    });

    describe("room.leave method", function() {

      it("throw an error if missing parameters", function(done) {
        params = {};

        Meteor.call("room.leave", params, callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.errorType, "Match.Error");
          done()
        }));
      });

      it("room.leave if no missing parameters missing or incorrect", function() {

        Meteor.call("room.leave", {userId: chatterUser._id, roomId: room._id});
        const results = Chatter.UserRoom.find({userId: chatterUser._id, roomId: room._id}).fetch();
        assert.equal(results.length, 0);
      });
    });

    describe("room.counter methods", function() {

      before(function() {
        new Chatter.UserRoom({userId: chatterUser._id, roomId: room._id }).save();
      });

      it("room counter returns true when called with right parameters", function(done) {

        Meteor.call("room.counter.reset", room._id , callbackWrapper((error, response) => {
          assert.isUndefined(error);
          assert.equal(response, true);
          done()
        }));
      });

      it("room counter does reset the counter to 0", function () {
        assert.equal(Chatter.UserRoom.findOne({roomId: room._id, userId: chatterUser._id}).unreadMsgCount, 0);
      });

      it("room counter return error when wrong roomId is passed in", function(done) {

        Meteor.call("room.counter.reset", "wrong room id" , callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "non-existing-room");
          done()
        }));
      });

      it("room counter return error when user is not in room", function(done) {
        Chatter.UserRoom.remove({userId: chatterUser._id, roomId: room._id});

        Meteor.call("room.counter.reset", room._id , callbackWrapper((error, response) => {
          assert.isUndefined(response);
          assert.equal(error.error, "user-not-in-room");
          done()
        }));
      });
    });
  });
});
