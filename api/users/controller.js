const mongoose = require('mongoose');
const moment = require('moment');
const Users = mongoose.model('Users');
const async = require('async');
const _ = require('lodash');

const controller = {};

controller.getUser = async (req, res) => {
    
    try {
        console.log(req.payload);

        if(req.payload._id.toString()===req.params.userId || req.payload.userType==='admin'){
            let query = {};

        query = {
            _id: mongoose.Types.ObjectId(req.params.userId)
        }
        let user = await Users.findOne(query).lean();
        return res.status(200).send(user);
        }else{
            res.status(401).send("UnAuthorised User");
        }
        
    } catch (err) {
        return res.status(500).send(err);
    }
};

controller.createUser = async (req, res) => {
    try {
        if(req.payload.userType==='admin'){
        let tempUser = await Users.findOne({ userName: req.body.userName }).lean();
        if (tempUser) {
            return res.status(400).send({ 'msg': 'username already exist' });
        } else {
            let user = new Users(req.body);
            user.createdOn = moment.utc().valueOf();
            user.createdBy = mongoose.Types.ObjectId(req.payload._id);
            user.status = 'active';
            user.setPassword(req.body.password);
            user = await user.save();
            return res.status(200).send(user);
        }
    }else{
        res.status(401).send("UnAuthorised User");
    }
    } catch (err) {
        return res.status(500).send(err);
    }
};



controller.editUser = async (req, res) => {
    try {
        if(req.payload._id.toString()===req.params.userId || req.payload.userType==='admin'){
        let query = {},
            updater = {};

        query = {
            _id: mongoose.Types.ObjectId(req.params.userId)
        }

        let tempUser = await Users.findById(req.params.userId).lean();
        if (tempUser.userName == req.body.userName) {
            updater = req.body;
            updater.updatedOn = moment.utc().valueOf();
            updater.updatedBy = mongoose.Types.ObjectId(req.payload._id);
            if(req.body.password){
              tempUser =  new Users();
                tempUser.setPassword(req.body.password);
            }
            updater.salt = tempUser.salt;
            updater.hash = tempUser.hash;
            user = await Users.findOneAndUpdate(query, updater).lean();
            user = await Users.findOne(query).lean();
            return res.status(200).send(user);
        } else {
            let tempUserOne = await Users.findOne({ userName: req.body.userName }).lean();
            if (tempUserOne) {
                return res.status(400).send({ 'msg': 'username already exist' });
            } else {
                updater = req.body;
                updater.updatedOn = moment.utc().valueOf();
                updater.updatedBy = mongoose.Types.ObjectId(req.payload._id);
                if(req.body.password){
                    tempUserOne =  new Users();
                    tempUserOne.setPassword(req.body.password);
                }
                updater.salt = tempUserOne.salt;
                updater.hash = tempUserOne.hash;
                user = await Users.findOneAndUpdate(query, updater).lean();
                user = await Users.findOne(query).lean();
                return res.status(200).send(user);
            }
        }
    }else{
        res.status(401).send("UnAuthorised User");
    }

    } catch (err) {
        return res.status(500).send(err);
    }
};



controller.deleteUser = async (req, res) => {
    try {
        if(req.payload._id.toString()===req.params.userId || req.payload.userType==='admin'){
        await Users.findByIdAndRemove(req.params.userId);
        return res.status(200).send("User Deleted Successfully");
        }else{
            res.status(401).send("UnAuthorised User");
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}

controller.getAllUsers = async (req, res) => {
    try {
        if(req.payload._id.toString()===req.params.userId || req.payload.userType==='admin'){
        let users,
            query = {},
            options = {
                sort: { 'createdOn': -1 },
                select: 'name userName userType email lifecycle status createdOn',
                lean: true,
                limit: 100000
            };

        for (key in req.query) {
            if (req.query[key] != "") {
                if (queryConstants.limitArray.indexOf(key) == -1) {
                    query[key] = new RegExp(req.query[key], 'i');
                } else {
                    options[key] = parseInt(req.query[key]);
                }
            }
        }

        query['status'] = 'active';
        users = await Users.paginate(query, options);
        res.status(200).json(users);
    }else{
        res.status(401).send("UnAuthorised User");
    }
    } catch (err) {
        return res.status(500).send(err);
    }
}

module.exports = controller;
