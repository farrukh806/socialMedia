const express = require('express');
const methodOverride = require('method-override');
const User = require('../models/User');
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require('../middleware/index.js');
router.use(methodOverride('_method'));

//?============== Show a user's profile

router.get('/user/:userId', isLoggedIn, async (req, res) => {
	let userProfile = await User.findById(req.params.userId);
	if (!userProfile) {
		req.flash('error', 'User not found');
		res.redirect('back');
	} else {
		let userData = await User.findById(req.params.userId).populate([
			{
				path: 'post',
				model: 'Post',
				populate: {
					path: 'author',
					model: 'User',
				},
			},
		]);
		res.render('profile', { user: userData });
	}
});

//?Search a specific user

router.get('/search/user', isLoggedIn, async (req, res) => {
	res.render('searchUser');
});

router.post('/search/user', isLoggedIn, async (req, res) => {
	let username = req.body.user;
	if (username === '') {
		req.flash('error', 'Username cannot be blank');
		res.redirect('back');
	} else {
		let foundUser = await User.find({ $text: { $search: username } });
		if (!foundUser) {
			req.flash('error', 'User not found.');
			res.redirect('/post');
		} else {
			for (let i = 0; i < foundUser.length; i++) {
				if (foundUser[i]._id.equals(req.user._id)) {
					foundUser.splice(i, 1);
				}
			}
			res.render(`search`, { users: foundUser, searchedUser: username });
		}
	}
});

//?============Follow a user

router.get('/user/:userId/follow', isLoggedIn, async (req, res) => {
	let user = await User.findById(req.params.userId);
	if (user._id.equals(req.user._id)) {
		req.flash('error', 'You can not follow your own account');
		res.redirect('back');
	} else if (user) {
		let userIndex = await req.user.following.indexOf(req.params.userId);
		if (userIndex + 1) {
			req.flash('error', 'You are already following this user');
			res.redirect(`/user/${req.params.userId}`);
		} else {
			let userFollowed = await req.user.following.push(req.params.userId);
			let followingList = await req.user.save();
			let followerList = await user.followers.indexOf(req.user._id);
			if (followerList + 1) {
				req.flash('error', 'User is already followed');
				res.redirect(`/user/${req.params.userId}`);
			} else {
				let followingUser = await user.followers.push(req.user._id);
				let savedList = await user.save();
				console.log(req.user.following);
				req.flash('success', `${user.displayName} is successfully followed.`);
				res.redirect(`/user/${req.params.userId}`);
			}
		}
	} else {
		req.flash('error', 'User not found');
		res.redirect('/post');
	}
});

//?============ Unfollow a user

router.get('/user/:userId/unfollow', isLoggedIn, async (req, res) => {
	let user = await User.findById(req.params.userId);
	if (user._id.equals(req.user._id)) {
		req.flash('error', 'You can not unfollow your own account');
		res.redirect('/post');
	} else if (user) {
		let userIndex = await req.user.following.indexOf(req.params.userId);
		if (userIndex !== -1) {
			let removedUser = await req.user.following.splice(userIndex, 1);
			let savedUserList = await req.user.save();
			let indexOfFollower = await user.followers.indexOf(req.user._id);
			let removedFollower = await user.followers.splice(indexOfFollower, 1);
			let savedList = await user.save();
			req.flash('success', 'Successfully unfollwed ' + user.displayName);
			res.redirect('/post');
		} else {
			req.flash('error', 'No such user');
			res.redirect('/post');
		}
	}
});

module.exports = router;
