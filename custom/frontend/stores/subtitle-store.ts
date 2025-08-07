import { defineStore } from "pinia";
import { ref, computed } from "vue";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

// Helper function for file uploads
const uploadFile = async (
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (onProgress && event.lengthComputable) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Invalid JSON response"));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("POST", url);
    xhr.send(formData);
  });
};

// Types
export interface SubtitleProject {
  id: number;
  name: string;
  description: string;
  video_file: string;
  video_duration: number;
  video_size: number;
  status: "uploading" | "processing" | "completed" | "failed";
  language: string;
  subtitle_count: number;
  is_processing: boolean;
  is_completed: boolean;
  user: string;
  created_at: string;
  updated_at: string;
}

export interface SubtitleEntry {
  id: number;
  project: number;
  project_name: string;
  start_time: number;
  end_time: number;
  text: string;
  language: string;
  confidence: number;
  is_edited: boolean;
  formatted_start_time: string;
  formatted_end_time: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface SubtitleStyle {
  id: number;
  name: string;
  description: string;
  css_class: string;
  is_active: boolean;
  created_at: string;
}

export interface SubtitleExport {
  id: number;
  project: number;
  project_name: string;
  format: string;
  file: string;
  file_url: string;
  style: number | null;
  style_name: string | null;
  created_at: string;
}

export const useSubtitleStore = defineStore("subtitle", () => {
  // State
  const projects = ref<SubtitleProject[]>([]);
  const currentProject = ref<SubtitleProject | null>(null);
  const subtitles = ref<SubtitleEntry[]>([]);
  const styles = ref<SubtitleStyle[]>([]);
  const exports = ref<SubtitleExport[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const completedProjects = computed(() =>
    projects.value.filter((project) => project.is_completed)
  );

  const processingProjects = computed(() =>
    projects.value.filter((project) => project.is_processing)
  );

  const projectById = computed(
    () => (id: number) => projects.value.find((project) => project.id === id)
  );

  const subtitlesByProject = computed(
    () => (projectId: number) =>
      subtitles.value.filter((subtitle) => subtitle.project === projectId)
  );

  // Actions
  const fetchProjects = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiCall("/api/subtitle/projects/");
      // Ensure we always set an array, even if the API returns something else
      projects.value = Array.isArray(response) ? response : [];
    } catch (err) {
      error.value = "Failed to fetch projects";
      console.error("Error fetching projects:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProject = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiCall(`/api/subtitle/projects/${id}/`);
      currentProject.value = response;
      return response;
    } catch (err) {
      error.value = "Failed to fetch project";
      console.error("Error fetching project:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadVideo = async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<SubtitleProject> => {
    try {
      loading.value = true;
      error.value = null;

      const project = await uploadFile(
        "/api/subtitle/projects/",
        formData,
        onProgress
      );

      // Ensure projects.value is an array before using unshift
      if (!Array.isArray(projects.value)) {
        projects.value = [];
      }

      projects.value.unshift(project);
      return project;
    } catch (err) {
      error.value = "Failed to upload video";
      console.error("Error uploading video:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getProjectStatus = async (id: number) => {
    try {
      const response = await apiCall(`/api/subtitle/projects/${id}/status/`);
      return response;
    } catch (err) {
      console.error("Error fetching project status:", err);
      throw err;
    }
  };

  const getProjectSubtitles = async (
    projectId: number
  ): Promise<SubtitleEntry[]> => {
    try {
      const response = await apiCall(
        `/api/subtitle/projects/${projectId}/subtitles/`
      );
      // Ensure we always set an array, even if the API returns something else
      subtitles.value = Array.isArray(response) ? response : [];
      return subtitles.value;
    } catch (err) {
      error.value = "Failed to fetch subtitles";
      console.error("Error fetching subtitles:", err);
      throw err;
    }
  };

  const updateSubtitle = async (id: number, data: Partial<SubtitleEntry>) => {
    try {
      const response = await apiCall(`/api/subtitle/entries/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });

      // Update local state
      const index = subtitles.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        subtitles.value[index] = response;
      }

      return response;
    } catch (err) {
      error.value = "Failed to update subtitle";
      console.error("Error updating subtitle:", err);
      throw err;
    }
  };

  const deleteSubtitle = async (id: number) => {
    try {
      await apiCall(`/api/subtitle/entries/${id}/`, {
        method: "DELETE"
      });

      // Remove from local state
      const index = subtitles.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        subtitles.value.splice(index, 1);
      }
    } catch (err) {
      error.value = "Failed to delete subtitle";
      console.error("Error deleting subtitle:", err);
      throw err;
    }
  };

  const splitSubtitle = async (id: number, splitTime: number) => {
    try {
      const response = await apiCall(`/api/subtitle/entries/${id}/split/`, {
        method: "POST",
        body: JSON.stringify({
          split_time: splitTime
        })
      });

      // Update local state
      const originalIndex = subtitles.value.findIndex((s) => s.id === id);
      if (originalIndex !== -1) {
        subtitles.value[originalIndex] = response.original_entry;
        subtitles.value.splice(originalIndex + 1, 0, response.new_entry);
      }

      return response;
    } catch (err) {
      error.value = "Failed to split subtitle";
      console.error("Error splitting subtitle:", err);
      throw err;
    }
  };

  const mergeSubtitle = async (id: number) => {
    try {
      const response = await apiCall(`/api/subtitle/entries/${id}/merge/`, {
        method: "POST"
      });

      // Update local state
      const index = subtitles.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        subtitles.value[index] = response;
      }

      return response;
    } catch (err) {
      error.value = "Failed to merge subtitle";
      console.error("Error merging subtitle:", err);
      throw err;
    }
  };

  const fetchStyles = async () => {
    try {
      const response = await apiCall("/api/subtitle/styles/");
      // Ensure we always set an array, even if the API returns something else
      styles.value = Array.isArray(response) ? response : [];
      return styles.value;
    } catch (err) {
      error.value = "Failed to fetch styles";
      console.error("Error fetching styles:", err);
      throw err;
    }
  };

  const exportSubtitles = async (
    projectId: number,
    format: string,
    styleId?: number
  ): Promise<Blob> => {
    try {
      const url = `${API_BASE_URL}/api/subtitle/projects/${projectId}/export/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          format,
          style_id: styleId
        })
      });

      if (!response.ok) {
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      return response.blob();
    } catch (err) {
      error.value = "Failed to export subtitles";
      console.error("Error exporting subtitles:", err);
      throw err;
    }
  };

  const fetchExports = async (projectId?: number) => {
    try {
      const url = projectId
        ? `/api/subtitle/exports/?project=${projectId}`
        : "/api/subtitle/exports/";

      const response = await apiCall(url);
      // Ensure we always set an array, even if the API returns something else
      exports.value = Array.isArray(response) ? response : [];
      return exports.value;
    } catch (err) {
      error.value = "Failed to fetch exports";
      console.error("Error fetching exports:", err);
      throw err;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await apiCall(`/api/subtitle/projects/${id}/`, {
        method: "DELETE"
      });

      // Remove from local state
      if (Array.isArray(projects.value)) {
        const index = projects.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          projects.value.splice(index, 1);
        }
      }

      // Clear current project if it's the deleted one
      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
    } catch (err) {
      error.value = "Failed to delete project";
      console.error("Error deleting project:", err);
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentProject = () => {
    currentProject.value = null;
    subtitles.value = [];
  };

  return {
    // State
    projects,
    currentProject,
    subtitles,
    styles,
    exports,
    loading,
    error,

    // Getters
    completedProjects,
    processingProjects,
    projectById,
    subtitlesByProject,

    // Actions
    fetchProjects,
    fetchProject,
    uploadVideo,
    getProjectStatus,
    getProjectSubtitles,
    updateSubtitle,
    deleteSubtitle,
    splitSubtitle,
    mergeSubtitle,
    fetchStyles,
    exportSubtitles,
    fetchExports,
    deleteProject,
    clearError,
    clearCurrentProject
  };
});
