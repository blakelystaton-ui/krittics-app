// trivia-trigger-plugin.js

// Ensure videojs is available globally
const videojs = window.videojs;

// 1. Define the Plugin function
// This function will be called when the player is initialized.
const triviaTriggerPlugin = function (options) {
    // 'this' refers to the Video.js player instance

    // We will use the 'options' object to access the 'triggers' data in the next step.
    const triggerData = options.triggers || [];

    console.log(
        `[Trivia Plugin] Activated. Found ${triggerData.length} trigger points.`,
    );

    // NOTE: All the advanced logic for watching time and pausing will go here in Step 2.
};

// 2. Register the plugin with Video.js
// The name MUST match the name used in index.html (plugins: { triviaTriggerPlugin: ... })
videojs.registerPlugin("triviaTriggerPlugin", triviaTriggerPlugin);

// This function must run before the player initialization script runs in index.html,
// which is why we included it with <script src="trivia-trigger-plugin.js"></script>.
