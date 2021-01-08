const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const User = require('./models/User');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dburl = process.env.dburl;
const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;
const PORT = process.env.PORT || 3000;
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comment');
const userRoutes = require('./routes/user');
app.use(
	require('express-session')({
		secret: 'i dont know',
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

mongoose.connect(dburl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

passport.use(
	new GoogleStrategy(
		{
			clientID: clientID,
			clientSecret: clientSecret,
			callbackURL: '/auth/google/callback',
		},
		async function (accessToken, refreshToken, profile, done) {
			const newUser = {
				googleId: profile.id,
				displayName: profile.displayName,
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				image: profile.photos[0].value,
			};
			try {
				let user = await User.findOne({ googleId: profile.id });

				if (user) {
					done(null, user);
				} else {
					user = await User.create(newUser);
					done(null, user);
				}
			} catch (err) {
				req.flash('error', 'Something went wrong.');
				console.error(err);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => done(err, user));
});

//? ================ ROUTES ==========

app.use(postRoutes);
app.use(commentRoutes);
app.use(userRoutes);

//?User signin using Google OAuth

app.get('/login', passport.authenticate('google', { scope: ['profile'] }));

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/login',
		successRedirect: '/post',
		failureFlash: true,
	}),
	function (req, res) {
		res.redirect('/post');
	}
);

app.get('*', async (req, res) => {
	res.render('error');
});
//?============ Server config
app.listen(PORT);
