require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

// Helper to interact with GitHub API (Push files, Create files, Update files)
async function pushToGithub(filePath, contentStr, commitMessage) {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        console.error("Missing GitHub credentials in .env");
        return;
    }
    
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    
    try {
        // 1. Get current file SHA (to see if it already exists)
        const res = await fetch(url, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`, 
                'Accept': 'application/vnd.github.v3+json' 
            }
        });
        
        let sha = null;
        if (res.ok) {
            const fileData = await res.json();
            sha = fileData.sha;
            console.log(`File ${filePath} exists. Updating...`);
        } else if (res.status === 404) {
            console.log(`File ${filePath} does not exist. Creating...`);
        } else {
            console.error(`Error checking file: ${res.status} ${res.statusText}`);
            return;
        }
        
        // 2. Upload/Create new file
        const contentBase64 = Buffer.from(contentStr).toString('base64');
        const uploadRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage || `Updated/Created ${filePath} via API`,
                content: contentBase64,
                ...(sha && { sha: sha }) // Only include sha if we are updating an existing file
            })
        });

        if (uploadRes.ok) {
            console.log(`✅ Successfully pushed ${filePath} to GitHub!`);
        } else {
            const errData = await uploadRes.json();
            console.error(`❌ Failed to push ${filePath}:`, errData);
        }
    } catch (error) {
        console.error("❌ Failed to connect to GitHub API:", error);
    }
}

// ==========================================
// EXAMPLE USAGE:
// ==========================================

async function runExamples() {
    console.log("Starting GitHub API examples...");

    // Example 1: Creating a brand new file
    await pushToGithub(
        'new_folder/hello.txt', 
        'Hello World! I created this file using the GitHub API!', 
        'Create a test file'
    );

    // Example 2: Updating an existing file (e.g. index.html)
    // Note: To do this properly, you would usually fs.readFileSync() your local index.html
    // and pass the string content here.
    /*
    const fs = require('fs');
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    await pushToGithub('index.html', htmlContent, 'Updated index.html via API');
    */
}

runExamples();
