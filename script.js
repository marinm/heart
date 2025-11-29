const channel = new URL(window.location).searchParams.get("channel") ?? "";
const SERVER_URL = `https://marinm.net/broadcast?channel=${channel}`;

let webSocket = null;
let connectedAt = null;
let tappedAt = null;

let sequenceNumber = 0;

const smallHeartsHere = new Set([]);

connect();

const bigHeart = document.getElementById("big-heart");
const smallHeartsLayer = document.getElementById("small-hearts-layer");
const statsLayer = document.querySelector("#stats-layer");

const animations = ["float-1", "float-2", "float-3", "float-4"];

let timeoutId = null;

function growHeart() {
    bigHeart.classList.add("tapped");
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => bigHeart.classList.remove("tapped"), 555);
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

    const animationName = randomAnimation();
    const timestamp = now();

    const message = {
        data: `${timestamp} ${animationName}`,
    };

    webSocket.send(JSON.stringify(message));
});

function now() {
    return Date.now();
}

function randomAnimation() {
    return animations[Math.floor(Math.random() * animations.length)];
}

function newHeart(animation, latency) {
    sequenceNumber++;

    const ownSequenceNumber = sequenceNumber;

    smallHeartsHere.add(ownSequenceNumber);

    showStats(latency);

    const heart = bigHeart.cloneNode(true);
    heart.id = "";
    heart.classList.add("small-heart");
    heart.style.animationName = animation;
    heart.style.animationDuration = "1500ms";
    smallHeartsLayer.appendChild(heart);
    heart.onanimationend = ({ target }) => {
        target.remove();
        smallHeartsHere.delete(ownSequenceNumber)
        clearStats();
    };
}

function showStats(latency) {
    statsLayer.classList.remove('transparent');
    statsLayer.innerHTML = `${latency}`;
}

function clearStats() {
    if (smallHeartsHere.size === 0) {
        statsLayer.classList.add('transparent');
    }
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
        const message = JSON.parse(String(event.data)).data;

        const [timestamp, animationName] = message.split(" ");

        const latency = now() - timestamp;

        if (animations.includes(animationName)) {
            newHeart(animationName, latency);
        }
    });
}
