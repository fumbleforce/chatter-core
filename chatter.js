Chatter = {
  options: {
    messageLimit: 30,
    nickProperty: "username",
    initialRoomLoad: 5
  }
};

Chatter.configure = function (opts) {
  _.extend(this.options, opts);
};

/**
 * @summary Retrieves nickname of user.
 * @locus Server
 * @param {object} meteor user.
 * @returns {string} the nickname of the user.
 */
function getNickname(user) {
  const nickPath = Chatter.options.nickProperty;
  const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);

  return nick;
}

/**
 * @summary Adds user to Chatter and defines its privileges
 * @locus Server
 * @param params Information about the new user.
 * @param {string} params.userId Meteor user id.
 * @param {string} params.userType Defines the restricitons on the new user. Can either be set to "admin" or "standard".
 * @returns {string} chatterId
 */
Chatter.addUser = function(params) {
  check(params, {
    userId: String,
    userType: Match.Maybe(String)
  });

  const {userId, userType} = params;
  let chatterUser = Chatter.User.findOne({userId});

  if (chatterUser) {
    throw new Meteor.Error("user-already-exists", "user has already been added to chatter");
  }

  const user = Meteor.users.findOne(userId);

  chatterUser = new Chatter.User({
    userId,
    userType,
    nickname: getNickname(user)
  })

  if (chatterUser.validate()) {
    return chatterUser.save();
  }

  chatterUser.throwValidationException();
};

/**
 * @summary Adds empty room to Chatter.
 * @locus Server
 * @param {string} params Information about the new room.
 * @param {string} params.name The name of the room.
 * @param {string} params.description The description of the room.
 * @returns {string} roomId
 */
Chatter.addRoom = function(params) {
  check(params, {
    name: String,
    description: String
  });

  const {name, description} = params;
  const room = new Chatter.Room({
    name,
    description
  })

  if (room.validate()) {
    return room.save();
  }

  room.throwValidationException();
};

/**
 * @summary Adds user to room.
 * @locus Server
 * @param params Information about the new room.
 * @param {string} params.userId Unique string identifying user.
 * @param {string} params.roomId Unique string identifying the room.
 * @returns {string} the string of the userRoom
 */
Chatter.addUserToRoom = function(params) {
  check(params, {
    userId: String,
    roomId: String
  });

  const {userId, roomId} = params;
  const chatterUser = Chatter.User.findOne({userId});
  const room = Chatter.Room.findOne(roomId);

  if (!room) {
    throw new Meteor.Error("room-does-not-exist", "the value provided for the roomId is incorrect");
  } else if (!chatterUser) {
    throw new  Meteor.Error("unknown-user", "user has not been added to chatter");
  }

  const userRoom = new Chatter.UserRoom({
    userId: chatterUser._id,
    roomId
  })

  if (userRoom.validate()) {
    return userRoom.save();
  }

  userRoom.throwValidationException();
};
