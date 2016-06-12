Chatter.Room = ChatterRoom = Astro.Class({
  name: "ChatterRoom",
  collection: new Mongo.Collection("chatterroom"),

  fields: {
    name: "string",

    description: "string",

    roomType: {
      type: "string"
    },

    lastActive: {
      type: "date",
      default: function() {
        return (new Date());
      }
    },

    archived: {
      type: "boolean",
      default: function() {
        return false;
      }
    },

    createdBy: "string"
  },

  validators: {
    name: [
      Validators.required(),
      Validators.minLength(1),
      Validators.maxLength(30)
    ],

    description: [
      Validators.required(),
      Validators.minLength(1),
      Validators.maxLength(150)
    ]
  },

  events: {

  },

  methods: {

  },

  behaviors: ["timestamp"]
});
