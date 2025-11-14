// krittics-plugin.js

// Import videojs (assuming you are using a module system or have it globally available)
// import videojs from 'video.js';

// Define the name of your plugin
const PLUGIN_NAME = "kritticsPlugin";

// Define the function that will be the plugin
const kritticsPlugin = function (options) {
  const player = this; // 'this' inside the plugin function refers to the videojs player instance

  // Default options for the plugin
  const defaults = {
    // You can add default settings here, like server endpoints or initial config
    debug: false,
    contentId: null,
  };

  // Merge default options with user-provided options
  const settings = videojs.mergeOptions(defaults, options);

  // Log to the console for verification that the plugin is running
  if (settings.debug) {
    player.log(
      `Krittics Plugin loaded successfully for content ID: ${settings.contentId}`,
    );
  }

  // --- Future Plugin Logic Goes Here ---
  // In later steps, this is where you'll add:
  // 1. Logic to listen for ad completion events.
  // 2. Integration with your Custom Video.js Plugin for the trivia trigger.
  // 3. Calls to your Firebase Cloud Functions backend.

  // Example of adding a simple function to the player's API
  player.krittics = {
    // A method to manually trigger the trivia event for testing
    startTrivia: () => {
      player.log("Trivia event triggered!");
      // Future: code to overlay the trivia question
    },
    // A simple getter for the content ID
    getContentId: () => settings.contentId,
  };

  // Ensure the plugin cleans up (optional, but good practice)
  player.on("dispose", () => {
    if (settings.debug) {
      player.log("Krittics Plugin is disposing.");
    }
  });
};

// 3. Register the plugin with Video.js
videojs.registerPlugin(PLUGIN_NAME, kritticsPlugin);
