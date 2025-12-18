const API_BASE = import.meta.env.PROD
  ? "https://surah-api-d95s.onrender.com/api"
  : "http://localhost:3000/api";

export interface JobPayload {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  repeatCount: number;
}

export const audioApi = {
  // Start the job and return the ID
  startJob: async (payload: JobPayload): Promise<string> => {
    const response = await fetch(`${API_BASE}/generate-audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to start job");
    const data = await response.json();
    return data.jobId;
  },

  // Check the status of a specific job
  checkStatus: async (
    jobId: string
  ): Promise<{ status: string; error?: string }> => {
    const response = await fetch(`${API_BASE}/status/${jobId}`);
    const data = await response.json();
    return data;
  },

  // Download the file as a Blob
  downloadFile: async (jobId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/download/${jobId}`);
    if (!response.ok) throw new Error("Download failed");
    return await response.blob();
  },
};
