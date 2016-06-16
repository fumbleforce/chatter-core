const emptyDatabase = function() {
  Chatter.UserRoom.remove({});
  Chatter.Room.remove({});
  Chatter.Message.remove({});
};

export default emptyDatabase;
