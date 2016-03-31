Meteor.methods({
    "message.build" (params) {
        return new Chatter.Message({
            message: params.message,
            roomId: params.roomId,
            userId: params.userId,
            userNick: getNickname(Meteor.user()),
            userAvatar: getAvatar(Meteor.user())
        }).save();
    },

    "userroom.build" (roomName) {
        const userId = Meteor.userId();
        const roomId = Chatter.Room.findOne({"name": roomName})._id;
        const records = Chatter.UserRoom.find({"userId": userId, "roomId" : roomId}).fetch();

        if (records === undefined || records.length === 0) {
            return new Chatter.UserRoom({
                roomId: roomId,
                userId: userId
            }).save();
        }
    },

    "room.build" (form) {
        const user = Meteor.user();
        return new Chatter.Room({
            name: form.name,
            roomType: form.roomType
        }).save();
    },

    "room.update" (id) {
        Chatter.Room.update({
            _id : id
        },
        {
            $set:{lastActive : new Date()}
        });
    },

    "room.users" (roomId) {
        const userRooms = Chatter.UserRoom.find({"roomId": roomId}).fetch();
        const users = userRooms.map(function(userRoom) {
            const user = Meteor.users.findOne({_id: userRoom.userId });
            const userInfo = {
                _id: user._id,
                userNick: getNickname(user)
            };
            return userInfo;
        });
        return users;
    },

    "userroomcount.reset" (userId, roomId) {
        return Chatter.UserRoomCount.update({
            roomId : roomId,
            userId: userId
        },
        {
            $set:{count: 0}
        });
    },

    "userroomcount.increase" (userId, roomId) {
        const userRooms = Chatter.UserRoom.find({"roomId": roomId, "userId": {$nin:[userId]}}).fetch();
        const users = userRooms.map(function(userRoom) {
            Chatter.UserRoomCount.update({
                roomId : userRoom.roomId,
                userId: userRoom.userId
            },
            {
                $inc: { count: 1}
            });
        });
    },

    "userroomcount.build" (userId, roomId ) {
        const records = Chatter.UserRoomCount.find({"userId": userId, "roomId" : roomId}).fetch();
        if (records === undefined || records.length === 0) {
            return new  Chatter.UserRoomCount({
                roomId: roomId,
                userId: userId
            }).save();
        }
    }
});

function getNickname(user) {
    const nickPath = Chatter.options.nickProperty;
    const nick = nickPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return nick;
}


function getAvatar(user) {
    const avatarPath = Chatter.options.avatarProperty;
    const avatar = avatarPath.split('.').reduce((prevVal, el) => prevVal[el] , user);
    return avatar;
}

