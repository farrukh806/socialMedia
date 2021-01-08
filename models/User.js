const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	googleId: {
		type: String,
		required: true,
	},
	displayName: {
		type: String,
		required: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	image: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	post: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
		},
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});


module.exports = mongoose.model('User', UserSchema);
