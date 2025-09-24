const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    email :{
        type: String,
        required: true,
        unique:true
    },
    fullName : {
        type: String,
        required: true,
        unique:true
    },
    password : {
        type: String,
        required: false,
        minlength:6

    },

},
{timestamps : true}

);
const Users = mongoose.model("Users",usersSchema);
module.exports = Users;