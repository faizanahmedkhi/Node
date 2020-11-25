const formidable = require('formidable');
const {check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const Users = require('../models/User');
const Posts = require('../models/Posts');
const flash = require('express-flash');
const dateFormat = require('dateformat');
const { resolveSoa } = require('dns');
const { get } = require('http');
const router = require('../routes/postRoutes');
const { runInNewContext } = require('vm');

const postForm = (req, res) => {
    res.render('createPost', {title: 'Create new Post', login: true, input_title: '', body: ''});
}

const storePost = (req, res) => {

    const form = formidable();

    form.parse(req, (err, fields, files) => {
         const errors = [];
         const{title, body} = fields;
         if(title.length === 0){
            errors.push({msg: 'Title fields is required!'})
         }
         if(body.length === 0){
            errors.push({msg: 'Body fields is required!'})
        }        
          const imageName = files.image.name;
          const split = imageName.split('.');
          const imageExt = split[split.length -1].toUpperCase();
          if(files.image.name.length === 0){
            errors.push({msg: 'Image field is required!'})
          } 
          else if(imageExt !== 'JPG' && imageExt !== 'PNG'){
            errors.push({msg: 'Only png and jpg extention allowed!'})
          }
          if(errors.length !== 0){
            res.render('createPost', {title: 'Create new Post', login: true, errors, input_title: title, body});
          }
          else{
              files.image.name = uuidv4() + "." + imageExt;
              const oldPath = files.image.path;
              const newPath = __dirname + "/../views/assets/img/" + files.image.name;
              fs.readFile(oldPath, (err, data) => {
                  if(!err){
                    fs.writeFile(newPath, data , (err) => {
                      if(!err){
                        fs.unlink(oldPath, async (err) => {
                          if(!err){
                             const id = req.id;
                             try{
                                const user = await Users.findOne({_id: id});
                                const name = user.name;
                                const newPost = new Posts({
                                  userID: id,
                                  title,
                                  body,
                                  image: files.image.name,
                                  userName: name
                                })
                                  try{
                                        const result = await newPost.save();
                                        if(result){
                                          req.flash('success', 'Your post add successfully!');
                                          res.redirect('/posts/1');
                                        }
                                  }catch(err){
                                    res.send(err.message);
                                  }
                             }catch(err){
                               res.send(err.message);
                             }
                          }
                        })
                      }
                    })
                  }
              })

          }

      });
}

const posts = async (req, res) => {
     const id = req.id;
     let currentPage = 1;
     let page = req.params.page;
     if(page){
       currentPage = page;
     }

     const perPage = 2;
     const skip = (currentPage - 1) * perPage;

     const allPosts = await Posts.find({userID: id,})
                                  .skip(skip)
                                  .limit(perPage)
                                 .sort({updatedAt: -1});                                      

      const count = await Posts.find({userID: id}).countDocuments();        

    res.render('Posts', {title: 'All posts', login: true, posts: allPosts, format: dateFormat, count, perPage, currentPage});
}

const details = async (req, res) => {
   const id = req.params.id;
   try{
    const details = await Posts.findOne({_id: id});
    res.render('details',{title: 'Detail Post', login: true, details})
   }catch(err){
     res.send(err.message);
   }
   
}

const update = async (req, res) => {
  const id = req.params.id;
  try{
   const getData = await Posts.findOne({_id: id});      
  res.render('update', {title: 'Update Post', login:true, update: getData})
  }catch(err){
    res.send(err.message);
  }
}

const postValidation = [
  check('title').not().isEmpty().withMessage('Title is Requied!'),
  check('body').not().isEmpty().withMessage('Body is Requied!')
]

const updatePost = async (req, res) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     const id = req.body.hiddenID;
     const getData = await Posts.findOne({_id: id});   
    res.render('update', {title: 'Update Post', login:true, errors: errors.array(), update: getData})
   }
   else{
          const {hiddenID, title, body} = req.body;
     try{         
         const updateRecord = await Posts.findByIdAndUpdate(hiddenID, {title, body});
         if(updateRecord){
           req.flash('success', 'Record update successfully!');
           res.redirect('/posts/1');
         }
     }catch(err){
       res.send(err.message);
     }
   }
}

const deletePost = async (req, res) => {
    const id = req.params.id;
     try{
            const deleteData = await Posts.findByIdAndRemove(id);
             if(deleteData){
               req.flash('success', 'Post deleted Successfully!');
               res.redirect('/posts/1');
             }
     }catch(err){
       res.send(err.message);
     }
}

module.exports = {
    postForm,
    storePost,
    posts,
    details,
    update,
    updatePost,
    postValidation,
    deletePost
}