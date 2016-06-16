const userInRoom = function(userId, roomId) {
  const userRooms = Chatter.UserRoom.find({userId: userId, roomId}).fetch();
  return userRooms.length > 0;
};

const checkIfChatterUser = function(userId) {
  const user = Meteor.users.findOne(userId);
  const addedToChatter =  user.profile.isChatterUser ? true : false;
  if (!addedToChatter) {
    throw new Meteor.Error("user-has-chatter-user", "user has not been added to chatter");
  }
};

Meteor.methods({

  "get.room.counts" () {
    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const userRooms = Chatter.UserRoom.find({userId}).fetch();
    const roomIds = userRooms.map(function(userRoom) {return userRoom.roomId});
    const rooms = Chatter.Room.find({"_id": {$in: roomIds}})

    const response = {
      archivedCount: 0,
      activeCount: 0
    };

    rooms.forEach(function(room){
      room.archived ? response.archivedCount += 1 : response.activeCount += 1;
    });

    return response;
  },

  "message.send" (params) {
    check(params, {
      message: String,
      roomId: String
    });

    const {message, roomId} = params;
    const userId =  Meteor.userId();

    checkIfChatterUser(userId);

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be in room to post messages");
    }

    const newMessage = new Chatter.Message({
      userId,
      message,
      roomId
    });

    if (newMessage.validate()) {
      return newMessage.save();
    }

    newMessage.throwValidationException();
  },

  "room.create" (params) {
    check(params, {
        name: String,
        description: String
    });

    const {name, description} = params;
    const userId =  Meteor.userId();

    checkIfChatterUser(userId);

    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    const room = new Chatter.Room({
      name,
      description,
      createdBy: userId
    })

    if (room.validate()) {
      const roomId = room.save();
      new Chatter.UserRoom({
        userId,
        roomId
      }).save();
      return roomId;
    }

    room.throwValidationException();
  },

  "room.join" (params) {
    check(params, {
      roomId: String,
      invitees: [String]
    });

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    const room = Chatter.Room.findOne(params.roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    let userNotexists = false;
    _.each(params.invitees, function(userId) {

      let user = Meteor.users.findOne(userId);
      if (user) {
        Chatter.UserRoom.upsert({
          userId: userId,
          roomId: room._id
        }, {
          $set: {
            userId: userId,
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

    const userIdToRemove = params.userId;

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);

    if(!user.profile.isChatterAdmin) {
      throw new Meteor.Error("user-is-not-admin", "user must be admin to remove users");
    }

    Chatter.UserRoom.remove({
      userId: userIdToRemove,
      roomId: params.roomId
    });
  },

  "room.get" (id) {
    check(id, String);
    checkIfChatterUser(Meteor.userId());
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
      return Meteor.users.findOne(userRoom.userId);
    });

    return users;
  },


  "user.changeNickname" (nickname) {
    check(nickname, String);

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);

    Meteor.users.update(
      userId,
    {
      $set:{"profile.chatterNickname": nickname}
    });

    return nickname;
  },

  "room.counter.reset" (roomId) {
    check(roomId, String);

    const userId =  Meteor.userId();
    checkIfChatterUser(userId);
    const user = Meteor.users.findOne(userId);
    const room = Chatter.Room.findOne(roomId);

    if (!room) {
      throw new Meteor.Error("non-existing-room", "room does not exist");
    }

    if (!userInRoom(userId, roomId)) {
      throw new Meteor.Error("user-not-in-room", "user must be reset counter");
    }

    const userRoomId = Chatter.UserRoom.findOne({roomId, userId: userId})._id;

    Chatter.UserRoom.update({
      _id: userRoomId
    },
    {
      $set:{unreadMsgCount: 0}
    });

    return true
  }
});
