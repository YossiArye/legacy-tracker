// Records every create/update/delete for later auditing.
// Pretend this writes to an external log service - hence the artificial delay.

let log = [];

function record(action, taskId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      log.push({ action, taskId, at: Date.now() });
      resolve();
    }, 50);
  });
}

function getLog() {
  return [...log];
}

function clearLog() {
  log = [];
}

export { record, getLog, clearLog };
