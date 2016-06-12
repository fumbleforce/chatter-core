Chatter.User = ChatterUser = Astro.Class({
  name: "ChatterUser",
  collection: new Mongo.Collection("chatteruser"),

  fields: {
    userType: {
      type: "string"
    },
    userId: {
      type: "string"
    },
    nickname: {
      type: "string"
    },
    avatar: {
      type: "string",
      default: function() {
        return "http://localhost:3000/packages/jorgeer_chatter-semantic/public/images/avatar.jpg";
      }
    }
  },

  validators: {

  },

  events: {

  },

  methods: {

  },

  behaviors: ["timestamp"]
});
