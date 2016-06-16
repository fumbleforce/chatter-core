Meteor.publish("chatterMessages", function (params) {
  check(params, {
    roomId: String
  });

  /*
  let room = ChatterRoom.findOne({ name: params.roomName });
  if (_.isUndefined(room)) return [];
  // TODO Check for room restrictions here
  */

  return ChatterMessage.find({
    roomId: params.roomId,
  }, {
    limit: Chatter.options.messageLimit,
    fields: {
      message: 1,
      roomId: 1,
      nickname: 1,
      avatar: 1,
      userId: 1,
      createdAt: 1
    }
  });
});

Meteor.publish("chatterRooms", function () {
  let user = Meteor.users.findOne(this.userId);

  // TODO do some clever things here to determine
  // which rooms are accessible

  return ChatterRoom.find({
  }, {
    fields: {
      name: 1,
      description: 1,
      roomType: 1,
      lastActive: 1,
      archived: 1,
      createdAt: 1
    }
  });
});

Meteor.publish("chatterUserRooms", function () {
  let user = Meteor.users.findOne(this.userId);

  // TODO do some clever things here to determine
  // which rooms are accessible

  return ChatterUserRoom.find({
  }, {
    fields: {
      unreadMsgCount: 1,
      userId: 1,
      roomId: 1
    }
  });
});

Meteor.publish("users", function (roomId) {
  // TODO do some clever things here to determine
  // which users are visible
  return Meteor.users.find({
  }, {
    fields: {
      _id: 1,
      username: 1,
      profile: 1,
      status: 1
    }
  });
});
