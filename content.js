let scrollInterval = null;
let delay = 17000; // Default delay of 20 seconds
let scrollAmount = 200;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "start") {

        delay = message.delay || 2000;

        if (!scrollInterval) {
            scrollInterval = setInterval(() => {

                // Stop if reached bottom
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    stopScrolling();
                    return;
                }

                window.scrollBy({
                    top: scrollAmount,
                    behavior: "smooth"
                });

            }, delay);
        }
    }

    if (message.action === "stop") {
        stopScrolling();
    }
});

function stopScrolling() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}
