import { chai } from "meteor/practicalmeteor:chai";

before(function() {

  stubs.create("userId", Meteor, "userId");
  stubs.userId.returns("meteor_user_one_id");

  stubs.create("findOne", Meteor.users, "findOne");

  stubs.findOne.returns({
    _id: "meteor_user_one_id",
    username: "meteor_user_one_nickname",
  });

  stubs.findOne.withArgs("id_of_user_one").returns({
    _id: "meteor_user_one_id",
    username: "meteor_user_one_nickname",
    profile: {
      isChatterUser: true,
      isChatterAdmin: true
    }
  });

  stubs.findOne.withArgs({_id: "id_of_user_two"}).returns({
    _id: "meteor_user_two_id",
    username: "meteor_user_two_nickname",
  });

  stubs.findOne.withArgs("non existent userId").returns(undefined);

  stubs.findOne.withArgs("id_of_user_one").returns({
    _id: "meteor_user_one_id",
    username: "meteor_user_one_nickname",
    profile: {
      isChatterUser: true,
      isChatterAdmin: true
    }
  });

  stubs.create("update", Meteor.users, "update");
  stubs.update.returns("updating");

});

import { modelTests } from "./server-tests/models.tests.js";
import { apiTests } from "./server-tests/api.tests.js";
import { methodTests } from "./server-tests/methods.tests.js";
