const container = document.getElementById("container");
const bigHeart = document.getElementById("big-heart");

bigHeart.addEventListener("click", newHeart);

function randomAnimation() {
	const animations = ["float-1", "float-2", "float-3", "float-4"];
	return animations[
		Math.floor(Math.random() * animations.length)
	];
}

function newHeart() {
	const heart = document.createElement("div");
	heart.classList.add("heart");
	heart.textContent = "❤️";
	heart.style.animationName = randomAnimation();
	heart.style.animationDuration = "1500ms";
	container.appendChild(heart);
	heart.onanimationend = ({ target }) => target.remove();
}