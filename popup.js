document.addEventListener("DOMContentLoaded", function () {

    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const delayInput = document.getElementById("delayInput");
    const themeSelect = document.getElementById("themeSelect");

    // ---------------- SCROLL LOGIC ----------------

    startBtn.addEventListener("click", async () => {
        const delayValue = parseInt(delayInput.value) || 17000;

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (delay) => {

                if (window.autoScrollInterval) return;

                window.autoScrollInterval = setInterval(() => {

                    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
                        clearInterval(window.autoScrollInterval);
                        window.autoScrollInterval = null;
                        return;
                    }

                    window.scrollBy({
                        top: 200,
                        behavior: "smooth"
                    });

                }, delay);

            },
            args: [delayValue]
        });
    });

    stopBtn.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (window.autoScrollInterval) {
                    clearInterval(window.autoScrollInterval);
                    window.autoScrollInterval = null;
                }
            }
        });
    });

    // ---------------- THEME LOGIC ----------------

    if (chrome.storage && chrome.storage.sync && themeSelect) {

        chrome.storage.sync.get(["theme"]).then((result) => {
            if (result.theme) {
                document.body.className = result.theme;
                themeSelect.value = result.theme;
            }
        });

        themeSelect.addEventListener("change", function () {
            const selectedTheme = themeSelect.value;
            document.body.className = selectedTheme;
            chrome.storage.sync.set({ theme: selectedTheme });
        });

    }

});
