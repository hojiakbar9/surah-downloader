// src/store/jobStore.js
const jobs = new Map();

export const jobStore = {
  create: (id, data) => {
    jobs.set(id, {
      id,
      status: "processing",
      stage: "initializing", // new field: initializing | downloading | stitching | completed
      progress: { current: 0, total: 0 }, // new field
      startTime: Date.now(),
      error: null,
      ...data,
    });
    return jobs.get(id);
  },

  get: (id) => jobs.get(id),

  // Allow updating any part of the job (status, stage, or progress)
  update: (id, updates) => {
    const job = jobs.get(id);
    if (job) {
      jobs.set(id, { ...job, ...updates });
    }
  },

  delete: (id) => jobs.delete(id),
};
