document.addEventListener("DOMContentLoaded", function () {

    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const delayInput = document.getElementById("delayInput");
    const themeSelect = document.getElementById("themeSelect");
    const statusText = document.getElementById("statusText");

    // ── helpers ──────────────────────────────────────────────────────────────

    function setScrolling(active) {
        if (active) {
            document.body.classList.add("scrolling");
            statusText.textContent = "Scrolling";
        } else {
            document.body.classList.remove("scrolling");
            statusText.textContent = "Idle";
        }
        chrome.storage.sync.set({ scrolling: active });
    }

    // ── restore state from storage ───────────────────────────────────────────

    chrome.storage.sync.get(["theme", "scrolling", "delay"]).then((result) => {

        // Theme
        if (result.theme) {
            document.body.className = result.theme + (result.scrolling ? " scrolling" : "");
            themeSelect.value = result.theme;
        }

        // Scrolling status
        if (result.scrolling) {
            statusText.textContent = "Scrolling";
        }

        // Delay
        if (result.delay) {
            delayInput.value = result.delay;
        }
    });

    // ── Start ─────────────────────────────────────────────────────────────────

    startBtn.addEventListener("click", async () => {
        const delayValue = parseInt(delayInput.value) || 17000;
        chrome.storage.sync.set({ delay: delayValue });

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (delay) => {
                if (window.autoScrollInterval) return;

                // Save original title and mark tab as scrolling
                if (!window._autoScrollOrigTitle) {
                    window._autoScrollOrigTitle = document.title;
                }
                document.title = "\u25B6 Scrolling... " + window._autoScrollOrigTitle;

                window.autoScrollInterval = setInterval(() => {
                    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
                        clearInterval(window.autoScrollInterval);
                        window.autoScrollInterval = null;
                        // Restore title when we hit the bottom
                        if (window._autoScrollOrigTitle) {
                            document.title = window._autoScrollOrigTitle;
                            window._autoScrollOrigTitle = null;
                        }
                        return;
                    }
                    window.scrollBy({ top: 200, behavior: "smooth" });
                }, delay);
            },
            args: [delayValue]
        });

        setScrolling(true);
    });

    // ── Stop ──────────────────────────────────────────────────────────────────

    stopBtn.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (window.autoScrollInterval) {
                    clearInterval(window.autoScrollInterval);
                    window.autoScrollInterval = null;
                }
                // Restore original tab title
                if (window._autoScrollOrigTitle) {
                    document.title = window._autoScrollOrigTitle;
                    window._autoScrollOrigTitle = null;
                }
            }
        });

        setScrolling(false);
    });

    // ── Theme ─────────────────────────────────────────────────────────────────

    themeSelect.addEventListener("change", function () {
        const selectedTheme = themeSelect.value;
        const isScrolling = document.body.classList.contains("scrolling");
        document.body.className = selectedTheme + (isScrolling ? " scrolling" : "");
        chrome.storage.sync.set({ theme: selectedTheme });
    });

});
