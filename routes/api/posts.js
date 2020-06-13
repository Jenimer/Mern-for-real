const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const user = require('../../models/User');
const profile = require('../../models/Profile');
const post = require('../../models/Post');

//@route    POST api/post
//@desc     Test route
//@acees    Private
router.post('/', 
[
  auth, 
  [
    check('text', 'text is required.').not().isEmpty()
  ]
], 
async (req,res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });

    const post = await newPost.save();
    res.json(post);

  } catch (err) {

    console.error(err.message);
    res.status(500).send('Server error');
  }
 
})

//@route    GET api/posts
//@desc     Get all posts
//@acees    Private
router.get('/', auth, async (req,res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})


//@route    GET api/posts/:id
//@desc     Get a single post by id
//@acees    Private

router.get('/:id', auth, async (req,res) => {
  try {

    const post = await Post.findById( req.params.id );

    if(!post){
      return res.status(404).json({ msg: 'Post not found.'})
    }

    res.json(post);

  } catch (err) {

    console.error(err.message);

    if(err.kind === 'ObjectId'){
      return res.status(404).json({ msg: 'Post not found.'})
    }

    res.status(500).send('Server error');

  }
})

//@route    DELETE api/posts/:id
//@desc     Delete a post
//@acees    Private

router.delete('/:id', auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if(!post){
      return res.status(404).json({ msg: 'Post not found.'});
    }

    //Check if user 
    if(post.user.toString() !== req.user.id){
      return res.status(401).json({ msg: 'User not authorized'});
    }

    await post.remove();

    res.json({ msg: 'Post removed' })

  } catch (err) {

    console.error(err.message);
    
    if(err.kind === 'ObjectId'){
      return res.status(404).json({ msg: 'Post not found.'});
    }
    
    res.status(500).send('Server error');
  }
})

//@route    PUT api/post/like/:id
//@desc     Like a post
//@acees    Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
      return res.status(400).json({ msg: 'Post already liked' })
    }
    post.likes.unshift({ user: req.user.id })
    await post.save()

    res.json(post.likes)

  } catch (err) {

    console.error(err.message)
    res.status(500).send('Server error.')

  }
})


//@route    PUT api/post/unlike/:id
//@desc     Unlike a post
//@acees    Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' })
    }
    
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save()

    res.json(post.likes)

  } catch (err) {

    console.error(err.message)
    res.status(500).send('Server error.')

  }
})



module.exports = router;