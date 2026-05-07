const fs = require('fs');
const http = require('http');

const BNET_URL = 'http://us.patch.battle.net:1119/pro/versions';
const CONFIG_FILE = './config.js';
const BUILD_FILE = './current_build.txt';

http.get(BNET_URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Parse BNET format
        const lines = data.split('\n');
        let currentBuild = null;
        for (const line of lines) {
            if (line.startsWith('us|')) {
                const parts = line.split('|');
                currentBuild = parts[4]; // BuildId
                break;
            }
        }

        if (!currentBuild) {
            console.error('Failed to parse build ID from Battle.net');
            process.exit(1);
        }

        console.log('Battle.net Current Build:', currentBuild);

        // Read stored build
        let storedBuild = '';
        if (fs.existsSync(BUILD_FILE)) {
            storedBuild = fs.readFileSync(BUILD_FILE, 'utf8').trim();
        }

        if (storedBuild && currentBuild !== storedBuild) {
            console.log(`Update detected! Previous: ${storedBuild}, New: ${currentBuild}`);
            
            // Overwrite config.js to disable loader
            const newConfig = `// --- Global Site Configuration ---
// Automatically updated by GitHub Actions bot when Overwatch updates.

const CONFIG = {
    // Cheat Status: "UNDETECTED", "UPDATING", "TESTING", "DETECTED"
    cheatStatus: "UPDATING",
    
    // Set to false to disable the 'Download Loader' button in the portal
    loaderEnabled: false,
    
    // Message to show if the loader is disabled (e.g., when updating)
    disabledMessage: "Overwatch just updated to build ${currentBuild}. We are currently updating offsets. Please check Discord for ETA."
};`;
            
            fs.writeFileSync(CONFIG_FILE, newConfig);
            fs.writeFileSync(BUILD_FILE, currentBuild);
            
            // Inform GitHub action that we made a change
            require('child_process').execSync('echo "updated=true" >> $GITHUB_OUTPUT');
        } else {
            console.log('No update detected. Everything is up to date.');
            if (!storedBuild) {
                fs.writeFileSync(BUILD_FILE, currentBuild);
                require('child_process').execSync('echo "updated=true" >> $GITHUB_OUTPUT');
            } else {
                require('child_process').execSync('echo "updated=false" >> $GITHUB_OUTPUT');
            }
        }
    });
}).on('error', err => {
    console.error('Network Error:', err.message);
    process.exit(1);
});
