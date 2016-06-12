import { chai } from "meteor/practicalmeteor:chai";

before(function() {

  stubs.create("findOne", Meteor.users, "findOne");

  stubs.findOne.returns({
    _id: "meteor_user_one_id",
    username: "meteor_user_one_nickname"
  });

  stubs.findOne.withArgs({_id: "id_of_user_one"}).returns({
    _id: "meteor_user_one_id",
    username: "meteor_user_one_nickname"
  });

  stubs.findOne.withArgs({_id: "id_of_user_two"}).returns({
    _id: "meteor_user_two_id",
    username: "meteor_user_two_nickname"
  });

});

import { modelTests } from "./server-tests/models.tests.js";
import { apiTests } from "./server-tests/api.tests.js";
import { methodTests } from "./server-tests/methods.tests.js";
