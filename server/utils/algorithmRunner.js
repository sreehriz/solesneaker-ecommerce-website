const { exec } = require('child_process');
const path = require('path');

// Compute absolute path to root directory which contains the compiled algorithms package
const ROOT_DIR = path.resolve(__dirname, '..', '..');

/**
 * Runs a Java algorithm by spawning a child process.
 * @param {string} algorithmName Name of the algorithm to run
 * @param {Array<string>} params Arguments to pass to the Java class
 * @returns {Promise<object>} Parsed JSON response from the Java execution
 */
function runAlgorithm(algorithmName, params = []) {
  return new Promise((resolve, reject) => {
    // Escape arguments for the command line (handling spaces and double quotes)
    const escapedParams = params.map(arg => {
      // Escape backslashes and double quotes, and wrap in double quotes
      let escaped = arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

    const command = `java -cp "${ROOT_DIR}" algorithms.algorithm "${algorithmName}" ${escapedParams.join(' ')}`;

    exec(command, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error for ${algorithmName}:`, error);
        console.error(`Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }

      try {
        const trimmedStdout = stdout.trim();
        // Read the last line in case there are warnings or other print statements before the JSON
        const lines = trimmedStdout.split('\n');
        const lastLine = lines[lines.length - 1];
        
        const result = JSON.parse(lastLine);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch (parseError) {
        console.error(`Failed to parse Java stdout for ${algorithmName}:`, stdout);
        reject(new Error(`Output parsing failed: ${parseError.message}. Raw output: ${stdout}`));
      }
    });
  });
}

module.exports = {
  runAlgorithm
};
