const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
	navLinks.classList.toggle('open');
	links.forEach((link) => {
		link.classList.toggle('fade');
	});
});
$('.delete-button').popup({
	inline: true,
});
$('.edit-button').popup({
	inline: true,
});

$('.message .close').on('click', function () {
	$(this).closest('.message').transition('fade');
});

let btn = document.querySelectorAll('.handleEvent');
let data, status;
btn.forEach((button) => {
	button.addEventListener('click', like);
});

async function like(e) {
	let postId = await e.target.id;
	doRequest(postId, e);
}

function doRequest(id, e) {
	axios
		.get(`/post/${id}/like`)
		.then(function (res) {
			data = res.data.length;
			status = res.data.liked;
		})
		.then(function () {
			e.target.innerText = data;
			if (status === false) {
				e.target.classList.remove('red');
			} else {
				e.target.classList.add('red');
			}
		})
		.catch(function (err) {
			let message = document.querySelector('.header');
			message.innerText = err;
		});
}
