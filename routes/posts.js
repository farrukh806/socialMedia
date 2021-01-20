const express = require('express');
const methodOverride = require('method-override');
const Post = require('../models/Post');
const User = require('../models/User');
const { isLoggedIn, postOwnership, saveImage } = require('../middleware/index');
const router = express.Router({ mergeParams: true });
router.use(methodOverride('_method'));

router.get('/', (req, res) => {
	res.render('home');
});

router.get('/post', isLoggedIn, async (req, res) => {
	let user = await User.findById(req.user._id).populate([
		{
			path: 'post',
			model: 'Post',
			populate: {
				path: 'author',
				model: 'User',
			},
			populate: {
				path: 'likes',
				model: 'User',
			},
			populate: {
				path: 'comment',
				model: 'Comment',
			},
			options: { sort: { createdAt: 'desc' } },
		},

		{
			path: 'following',
			model: 'User',
			populate: {
				path: 'post',
				model: 'Post',
				populate: {
					path: 'author',
					model: 'User',
				},
				populate: {
					path: 'likes',
					model: 'User',
				},
				populate: {
					path: 'comment',
					model: 'Comment',
				},
			},
			options: { sort: { createdAt: 'desc' } },
		},
	]);
	if (user.following.length === 0);
	res.render('post/dashboard', { postData: user });
});

router.get('/post/new', isLoggedIn, (req, res) => {
	res.render('post/newPost');
});

//?============= Create new post
router.post('/post/new', isLoggedIn, async (req, res) => {
	if (req.body.description === '' && req.body.file === '') {
		req.flash('error', "Post can't be empty!");
		res.redirect('/post/new');
	} else {
		let post = new Post({
			description: req.body.description,
			author: req.user._id,
		});

		if (req.body.file) {
			saveImage(post, req.body.file);
		}
		try {
			const newPost = await post.save();
			let userFound = await User.findById(req.user._id);
			if (userFound) {
				let postSaved = await userFound.post.push(newPost._id);
				let userSaved = await userFound.save();
			} else {
				req.flash('error', 'Something went wrong.');
			}
			res.redirect(`/user/${req.user._id}`);
		} catch (err) {
			req.flash('error', 'Something went wrong!');
			res.redirect('back');
		}
	}
});

//?================== Show a specific post
router.get('/post/:postId', isLoggedIn, async (req, res) => {
	let found = await Post.findById(req.params.postId);
	if (found) {
		let found = await Post.findById(req.params.postId).populate([
			{
				path: 'author',
				model: 'User',
			},
			{
				path: 'comments',
				model: 'Comment',
				populate: {
					path: 'commentAuthor',
					model: 'User',
				},
			},
		]);
		res.render('post/info', { postData: found });
	} else {
		req.flash('error', 'Post not found.');
		res.redirect('/post');
	}
});

//?================== Edit post

router.get('/post/:postId/edit', postOwnership, async (req, res) => {
	let post = await Post.findById(req.params.postId);
	if (post) {
		res.render('post/edit', { editData: post });
	} else {
		req.flash('error', 'Post not found');
		res.redirect(`/post`);
	}
});

router.put('/post/:postId', async (req, res) => {
	let postUpdated = await Post.findByIdAndUpdate(
		req.params.postId,
		req.body.post
	);
	if (postUpdated) {
		req.flash('success', 'Updated');
		res.redirect(`/post/${req.params.postId}`);
	} else {
		req.flash('error', 'Something went wrong');
		res.redirect(`/post/${req.params.postId}`);
	}
});

//?============ Like a post
router.get('/post/:postId/like', isLoggedIn, async (req, res) => {
	let postFound = await Post.findById(req.params.postId);
	if (!postFound) {
		req.flash('error', 'Post not found');
		res.sendStatus(404).send('Not found');
	} else {
		let likedByUser = await postFound.likes.indexOf(req.user._id);
		try {
			if (likedByUser === -1) {
				let savedList = await postFound.likes.push(req.user._id);
				let saved = await postFound.save();
				res.json({ length: postFound.likes.length, liked: true });
			} else {
				let likeRemoved = await postFound.likes.splice(likedByUser, 1);
				let saved = await postFound.save();
				res.json({ length: postFound.likes.length, liked: false });
			}
		} catch (e) {
			console.log(e);
		}
	}
});

//?============ Delete post route

router.delete('/post/:postId', postOwnership, async (req, res) => {
	let deletedPost = await Post.findByIdAndDelete(req.params.postId);
	if (deletedPost) {
		let user = await User.findById(req.user._id);
		let postIndex = await user.post.indexOf(req.params.postId);
		let postRemovedFromArray = await user.post.splice(postIndex, 1);
		let savePostArray = await user.save();
		req.flash('success', 'Post deleted successfully.');
		res.redirect(`/post`);
	} else {
		req.flash('error', 'Something went wrong.');
		res.redirect(`/post/${req.params.postId}`);
	}
});

module.exports = router;
