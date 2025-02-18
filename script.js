const channel = new URL(window.location).searchParams.get("channel") ?? "";
const SERVER_URL = `https://marinm.net/broadcast?channel=${channel}`;

let webSocket = null;
let connectedAt = null;
let tappedAt = null;

connect();

const container = document.getElementById("container");
const bigHeart = document.getElementById("big-heart");

const animations = ["float-1", "float-2", "float-3", "float-4"];

let timeoutId = null;

function growHeart() {
    bigHeart.classList.add("tapped");
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        bigHeart.classList.remove("tapped");
    }, 250);
}

bigHeart.addEventListener("click", () => {
    tappedAt = Date.now();
    growHeart();

    if (webSocket == null || webSocket.readyState == WebSocket.CLOSED) {
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
    const heart = bigHeart.cloneNode(true);
    heart.id = "";
    heart.classList.add("small-heart");
    heart.style.animationName = animation;
    heart.style.animationDuration = "1500ms";
    container.appendChild(heart);
    heart.onanimationend = ({ target }) => target.remove();
}

function connect() {
    webSocket = new WebSocket(SERVER_URL);

    webSocket.addEventListener("open", () => {
        console.log("open");
        connectedAt = Date.now();
        bigHeart.classList.remove("grayscale");
    });

    webSocket.addEventListener("close", () => {
        console.log("close");
        const now = Date.now();
        const tappedMessage = tappedAt
            ? `or ${now - tappedAt} ms since tapped`
            : "not tapped";
        console.log(
            `connection lasted ${now - connectedAt} ms, ${tappedMessage}`
        );
        bigHeart.classList.add("grayscale");
    });

    webSocket.addEventListener("message", (event) => {
        const animation = String(event.data);

        if (animations.includes(animation)) {
            newHeart(animation);
        }
    });
}
