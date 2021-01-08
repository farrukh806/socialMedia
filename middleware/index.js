const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const Post = require('../models/Post');
const Comment = require('../models/Comment');
let obj = {};

obj = {
	isLoggedIn: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	},

	saveImage: function (post, postEncoded) {
		if (postEncoded == null) return;
		const posted = JSON.parse(postEncoded);
		if (posted != null && imageMimeTypes.includes(posted.type)) {
			post.image = new Buffer.from(posted.data, 'base64');
			post.imageType = posted.type;
		}
	},

	commentOnwnership: async function (req, res, next) {
		if (req.isAuthenticated()) {
			let commentFound = await Comment.findById(req.params.commentId);
			if (!commentFound) {
				req.flash('error', 'Comment not found');
				res.redirect('back');
			} else {
				if (commentFound.commentAuthor.equals(req.user._id)) {
					return next();
				} else {
					req.flash('error', 'Invalid user');
					res.redirect('back');
				}
			}
		} else {
			res.redirect('back');
		}
	},
	postOwnership: async function (req, res, next) {
		if (req.isAuthenticated()) {
			let postFound = await Post.findById(req.params.postId);
			if (!postFound) {
				req.flash('error', 'Post not found');
				res.redirect('back');
			} else {
				if (postFound.author.equals(req.user._id)) {
					return next();
				} else {
					req.flash('error', 'Invalid user');
					res.redirect('back');
				}
			}
		} else {
			res.redirect('back');
		}
	},
};

module.exports = obj;
