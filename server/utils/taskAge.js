// Computes task age for display in API responses.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Returns how many whole days old a task is, based on its `createdAt` timestamp.
 * @param {object} task - a task record (as returned by the store)
 * @param {number} task.createdAt - creation time in ms since epoch
 * @returns {number} age in whole days
 */
function getTaskAgeInDays(task) {
  return Math.floor((Date.now() - task.createdAt) / MS_PER_DAY);
}

export { getTaskAgeInDays };
