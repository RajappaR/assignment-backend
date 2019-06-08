const mongoose = require('mongoose');
const paginate = require('mongoose-paginate')
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const LifecycleSchema = new Schema({
    createdOn: Date,
    msg: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
})

const UsersSchema = new Schema({
    hash: String,
    salt: String,
    name: String,
    email: String,
    userName: String,
    userType:{
        type:String,
        default:"user",
        enum:['user','admin','manager']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default:'active'
    },
    createdOn: Date,
    updatedOn: Date,
    lifecycle:[LifecycleSchema]
});




UsersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
};

UsersSchema.methods.validatePassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign(
        {
            _id: this._id,
            exp: parseInt(expirationDate.getTime() / 1000, 10),
            name: this.name,
            userName: this.userName,
            email:this.email,
            userType: this.userType,
            status: this.status,
            lifecycle: this.lifecycle
        },
        'assignmentjwtsecret410'
    );
};

UsersSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        token: this.generateJWT(),
        userName: this.userName,
        name: this.name,
        userName: this.userName,
        email:this.email,
        userType: this.userType,
        status: this.status,
        lifecycle: this.lifecycle
    };
};

UsersSchema.pre('save', function (next) {
    this.createdOn = Date.now();
    next();
});

UsersSchema.plugin(paginate);
mongoose.model('Users', UsersSchema);
