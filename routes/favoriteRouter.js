const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res)=> {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favUser) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favUser);
    }, (err) => next(err))
    .catch((err) => next(err));   
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favUser) => {
       if(favUser!=null){
           for(i=0; i< req.body.length; i++){
               if(favUser.dishes.indexOf(req.body[i]._id) ===-1){
                   favUser.dishes.push(req.body[i]._id);
               }
           }
           favUser.save()
            .then((favUser)=> {
                Favorites.findById(favUser._id)
                    .then((favUser) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favUser);
                    })            
            }, (err)=> next(err)) ; 
           
       }
       else{
            Favorites.create({"user": req.user._id, "dishes": req.body})
            .then((favUser) => {
                console.log('Favorite User Created ', favUser);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favUser);
            }, (err) => next(err))
            .catch((err) => next(err)); 
       }
    }, (err) => next(err))
    .catch((err) => next(err));   
      
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favUser) => {
        if(favUser!=null){
            favUser.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));  
        }  
        else{
            err = new Error('Favorite User ' + req.user._id + ' not found');
            err.status = 404;
            return next(err);  
        } 
    }, (err) => next(err))
    .catch((err) => next(err));       
});

favoriteRouter.route('/:favDishId')
.options(cors.corsWithOptions, (req,res)=> {res.sendStatus(200);})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites/'+ req.params.favDishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favUser) => {
       if(favUser!=null){
           if(favUser.dishes.indexOf(req.params.favDishId) ===-1){
                favUser.dishes.push(req.params.favDishId);
           }      
           favUser.save()
            .then((favUser)=> {
                Favorites.findById(favUser._id)
                    .then((favUser) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favUser);
                    })            
            }, (err)=> next(err)) ; 
           
       }
       else{
            Favorites.create({"user": req.user._id, "dishes": [req.params.favDishId]})
            .then((favUser) => {
                console.log('Favorite User Created ', favUser);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favUser);
            }, (err) => next(err))
            .catch((err) => next(err)); 
       }
    }, (err) => next(err))
    .catch((err) => next(err));   
      
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favUser) => {
       if(favUser!=null){
           if(favUser.dishes.indexOf(req.params.favDishId) !==-1){
                favUser.dishes.remove(req.params.favDishId);
           }      
           favUser.save()
            .then((favUser)=> {
                Favorites.findById(favUser._id)
                    .then((favUser) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favUser);
                    })            
            }, (err)=> next(err)) ; 
           
       }
       else{  
            err = new Error('Favorite Dish ' + req.params.favDishId + ' not found');
            err.status = 404;
            return next(err);   
       }
    }, (err) => next(err))
    .catch((err) => next(err));  
});

module.exports = favoriteRouter;
