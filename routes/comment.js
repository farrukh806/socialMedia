const express = require('express');
const methodOverride = require('method-override');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, commentOnwnership } = require('../middleware/index.js');
router.use(methodOverride('_method'));

//?============= Add a new comment
router.post('/post/:postId/comment/new', isLoggedIn, async (req, res) => {
	if (req.body.comment === '') {
		req.flash('error', 'Comment can not be empty.');
		res.redirect(`/post/${req.params.postId}`);
	} else {
		var postFound = await Post.findById(req.params.postId);
		if (!postFound) {
			req.flash('error', 'Post not found');
			res.redirect(`/post/${req.params.postId}`);
		} else {
			let comment = new Comment({
				text: req.body.comment,
				commentAuthor: req.user._id,
			});
			Comment.create(comment, async (failed, commentCreated) => {
				if (failed) {
					req.flash('error', 'Something went wrong.');
					res.redirect(`/post/${req.params.postId}`);
				} else {
					try {
						postFound.comments.push(commentCreated);
						let resp = await postFound.save();
						req.flash('success', 'Comment added');
						res.redirect(`/post/${req.params.postId}`);
					} catch (e) {
						console.log(e);
						req.flash('error', 'Something went wrong.');
						res.redirect(`/post/${req.params.postId}`);
					}
				}
			});
		}
	}
});

//?============== Edit comment route

router.get(
	'/post/:postId/comment/:commentId',
	commentOnwnership,
	async (req, res) => {
		let commentFound = await Comment.findById(req.params.commentId);
		if (!commentFound) {
			req.flash('error', 'Comment not found');
			res.redirect(`/post/${req.params.postId}`);
		} else {
			res.render('comment/edit', {
				postId: req.params.postId,
				comment: commentFound,
			});
		}
	}
);

router.put(
	'/post/:postId/comment/:commentId',
	commentOnwnership,
	async (req, res) => {
		if (req.body.comment.text === '') {
			req.flash('error', 'Comment can not be empty');
			res.redirect(`/post/${req.params.postId}`);
		} else {
			let updatedComment = await Comment.findByIdAndUpdate(
				req.params.commentId,
				req.body.comment
			);
			if (!updatedComment) {
				req.flash('error', 'Something went wrong.');
				res.redirect(`/post/${req.params.postId}`);
			} else {
				req.flash('success', 'Comment updated');
				res.redirect(`/post/${req.params.postId}`);
			}
		}
	}
);

//?================ Delete comment route

router.delete(
	'/post/:postId/comment/:commentId',
	commentOnwnership,
	async (req, res) => {
		let postFound = await Post.findById(req.params.postId);
		if (!postFound) {
			req.flash('error', 'Post not found');
			res.redirect('/post');
		} else {
			let commentIndex = await postFound.comments.indexOf(req.params.commentId);
			if (postFound.comments.length === 1 && commentIndex + 1) {
				let poppedComent = postFound.comments.pop();
				let post = await postFound.save();
				let returnedComment = await Comment.findByIdAndDelete(
					req.params.commentId
				);
				req.flash('success', 'Comment Deleted');
				res.redirect(`/post/${req.params.postId}`);
			} else if (commentIndex) {
				let deletedComment = await postFound.comments.splice(commentIndex, 1);
				let savedPost = await postFound.save();
				let returnedComment = await Comment.findByIdAndDelete(
					req.params.commentId
				);
				req.flash('success', 'Comment Deleted');
				res.redirect(`/post/${req.params.postId}`);
			} else {
				req.flash('error', 'Comment Not found');
				res.redirect('back');
			}
		}
	}
);

module.exports = router;
