let webSocket = null;

connect();

const container = document.getElementById("container");
const bigHeart = document.getElementById("big-heart");

const animations = ["float-1", "float-2", "float-3", "float-4"];

bigHeart.addEventListener("click", () => {
	if (webSocket?.readyState == WebSocket.CLOSED) {
		connect();
		return;
	}
	if (webSocket?.readyState !== WebSocket.OPEN) {
		return;
	}
	console.log("send");
	webSocket.send(randomAnimation());
});

function randomAnimation() {
    return animations[Math.floor(Math.random() * animations.length)];
}

function newHeart(animation) {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    heart.style.animationName = animation;
    heart.style.animationDuration = "1500ms";
    container.appendChild(heart);
    heart.onanimationend = ({ target }) => target.remove();
}

function connect() {
	webSocket = new WebSocket("https://marinm.net/broadcast");

	webSocket.addEventListener("open", () => {
		console.log("open");
		bigHeart.classList.remove('grayscale');
	});

	webSocket.addEventListener("close", () => {
		console.log("close");
		bigHeart.classList.add('grayscale');
	});

	webSocket.addEventListener("message", (event) => {
		const animation = String(event.data);
	
		if (animations.includes(animation)) {
			newHeart(animation);
		}
	});
}
