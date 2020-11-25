const express = require('express');
const router = express.Router();

const {postForm,storePost,posts,details,update,updatePost,postValidation,deletePost} = require('../controllers/postController');
const {auth} = require('../middlewares/auth');

router.get('/createPost', auth, postForm);
router.post('/createPost', auth, storePost);
router.get('/posts/:page', auth, posts);
router.get('/details/:id', auth, details);
router.get('/update/:id', auth, update);
router.post('/update', [postValidation, auth], updatePost);
router.get('/delete/:id', auth, deletePost);

module.exports = router;