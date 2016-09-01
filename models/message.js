const reqStrNotNull = Validators.and([
  Validators.required(),
  Validators.string(),
  Validators.notNull()
]);

Chatter.Message = ChatterMessage = Astro.Class({
  name: "ChatterMessage",
  collection: new Mongo.Collection("chattermessage"),

  fields: {
    userId: {
      type: "string",
      validator: [
        reqStrNotNull
      ]
    },

    roomId: {
      type: "string",
      validator: [
        reqStrNotNull
      ]
    },

    message: {
      type: "string",
      validator: [
        Validators.minLength(1, 'The message must not be empty!'),
        Validators.maxLength(1000),
        reqStrNotNull
      ]
    },

    nickname: {
      type: "string"
    },

    avatar: {
      type: "string"
    }
  },

  events: {
    beforeSave: function(e) {
      increaseCounter(this);
      updateRoom(this.roomId);
    }
  },

  methods: {
    getTimeAgo: function () {
      return moment(this.get("createdAt")).fromNow();
    },
    getMinutesAgo: function () {
      const now = moment(new Date());
      const then = this.get("createdAt");
      const duration = moment.duration(now.diff(then)).asMinutes();
      return duration;
    },
    getDate: function () {
      return moment(this.get("createdAt")).format("MMMM Do");
    }
  },

  behaviors: ["timestamp"]
});


const increaseCounter = function(message) {
  const userRooms = Chatter.UserRoom.find({"roomId": message.roomId, "userId": {$nin:[message.userId]}}).fetch();
  const users = userRooms.map(function(userRoom) {
    Chatter.UserRoom.update({
      roomId : userRoom.roomId,
      userId: userRoom.userId
    },
    {
      $inc: { unreadMsgCount: 1}
    });
  });
};

const updateRoom = function(roomId) {
  Chatter.Room.update({
    _id : roomId
  },
  {
    $set:{lastActive : new Date()}
  });
};
