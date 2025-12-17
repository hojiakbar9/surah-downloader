const jobs = new Map();

export const jobStore = {
  // Create a new job
  create: (id, data) => {
    jobs.set(id, {
      id,
      status: "processing",
      startTime: Date.now(),
      error: null,
      ...data, // includes path, surahNumber, etc.
    });
    return jobs.get(id);
  },

  // Get a job by ID
  get: (id) => {
    return jobs.get(id);
  },

  // Update a job's status
  updateStatus: (id, status, error = null) => {
    const job = jobs.get(id);
    if (job) {
      job.status = status;
      if (error) job.error = error;
      jobs.set(id, job);
    }
  },

  // Delete a job (cleanup)
  delete: (id) => {
    jobs.delete(id);
  },
};
