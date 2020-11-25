const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
     name: {
         type: String,
         require: true,
         minlength: 3
     },
     email: {
        type: String,
        require: true,
        
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    }
},
    {timestamps:true}
)

const Users = mongoose.model('user', userSchema);
module.exports = Users;