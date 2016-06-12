const emptyDatabase = function() {
  Chatter.User.remove({});
  Chatter.UserRoom.remove({});
  Chatter.Room.remove({});
  Chatter.Message.remove({});
};

export default emptyDatabase;
