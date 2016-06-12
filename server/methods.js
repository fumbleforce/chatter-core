const getChatterUserId = function(userId) {
  const chatterUser = Chatter.User.findOne({userId: userId});
  if (!chatterUser) {
    throw new Meteor.Error("unknown-user", "user has not been added to chatter");
  }
  return chatterUser._id;
};

const userInRoom = function(chatterId, roomId) {
  const userRooms = Chatter.UserRoom.find({userId: chatterId, roomId}).fetch();
  return userRooms.length > 0;
};


Meteor.methods({

  "user.check" () {
    const chatterUsers = Chatter.User.find({userId: Meteor.userId()}).fetch();
    return chatterUsers.length > 0;
  },

  "message.send" (params) {
    check(params, {
      message: String,
      roomId: String
    });

    const {message, roomId} = params;
    const chatterUserId = getChatterUserId(Meteor.userId());

    if (!userInRoom(chatterUserId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    const newMessage = new Chatter.Message({
      userId: chatterUserId,
      message,
      roomId
    });


    if (newMessage.validate()) {
      return newMessage.save();
    }

    newMessage.throwValidationException();
  },

  "room.join" (params) {
    check(params, {
      roomId: String,
      invitees: [String]
    });

    const room = Chatter.Room.findOne(params.roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }
    let userNotexists = false;
    _.each(params.invitees, function(chatterUserId) {
      let chatterUser = Chatter.User.findOne(chatterUserId);
      if (chatterUser) {
        Chatter.UserRoom.upsert({
          userId: chatterUserId,
          roomId: room._id
        }, {
          $set: {
            userId: chatterUserId,
            roomId: room._id
          }
       });
      } else {
        userNotexists = true;
        return false;
      }
    })
    if (userNotexists) {
      throw new Meteor.Error("non-existing-users", "user does not exist");
    }
    return Chatter.UserRoom.findOne()._id;
  },

  "room.leave" (params) {
    check(params, {
      userId: String,
      roomId: String
    });

    Chatter.UserRoom.remove({
      userId: params.userId,
      roomId: params.roomId
    });
  },

  "room.create" (params) {
    check(params, {
        name: String,
        description: String
    });

    const {name, description} = params;
    const chatterUserId = getChatterUserId(Meteor.userId());

    const room = new Chatter.Room({
      name,
      description,
      createdBy: chatterUserId
    })

    if (room.validate()) {
      return room.save();
    }

    room.throwValidationException();
  },

  "room.get" (id) {
    check(id, String);
    return Chatter.Room.findOne({
      _id : id
    });
  },

  "room.archive" (params) {
    check(params, {
        roomId: String,
        archived: Boolean
    });

    const {roomId, archived} = params;
    const room = Chatter.Room.findOne(roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    Chatter.Room.update({
      _id : roomId
    },
    {
      $set:{archived: archived}
    });
    return archived;
  },

  "room.users" (roomId) {
    check(roomId, String);

    const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
    const users = userRooms.map(function(userRoom) {
      return Chatter.User.findOne(userRoom.userId);
    });

    return users;
  },

  "room.counter.reset" (roomId) {
    check(roomId, String);

    const chatterUserId = getChatterUserId(Meteor.userId());
    const room = Chatter.Room.findOne(roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    if (!userInRoom(chatterUserId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    Chatter.UserRoom.update({
      roomId: roomId,
      userId: chatterUserId
    },
    {
      $set:{unreadMsgCount: 0}
    });
    return true
  }
});
