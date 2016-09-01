Chatter.Room = ChatterRoom = Astro.Class({
  name: "ChatterRoom",
  collection: new Mongo.Collection("chatterroom"),

  fields: {
    name: {
      type: "string",
      validator: [
        Validators.required(),
        Validators.minLength(1),
        Validators.maxLength(30)
     ]
    },

    description: {
      type: "string",
      validator: [
        Validators.required(),
        Validators.minLength(1),
        Validators.maxLength(150)
     ]
    },

    roomType: {
      type: "string"
    },

    lastActive: {
      type: "date",
      default: function() {
        return (new Date());
      }
    },

    createdBy: "string"
  },

  events: {

  },

  methods: {
    getTimeAgo: function () {
      return moment(this.get("createdAt")).fromNow();
    }
  },

  behaviors: ["timestamp"]
});
