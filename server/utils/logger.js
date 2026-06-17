// Minimal logger. FIXME: replace with a real logging library before this
// goes anywhere near production.

function log(message) {
  console.log(`[TrackIt] ${new Date().toISOString()} - ${message}`);
}

export { log };
