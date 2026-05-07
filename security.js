// --- Basic Client-Side Anti-Skid / Anti-Inspect Measures ---
// Note: This prevents casual inspection and visual tampering.
// Actual security relies on the KeyAuth backend verification.

(function() {
    // 1. Disable Right Click (Context Menu)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Inspector)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Element Inspector)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // 3. DevTools Crash / Trap Loop
    // This constantly triggers the debugger if DevTools is open, making it incredibly annoying/difficult to use.
    setInterval(function() {
        (function() {
            return false;
        })
        ['constructor']('debugger')
        ['call']();
    }, 100);
})();
