import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// Retry lahat ng naghihintay
const processQueue = (error) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      // May refresh na bang tumatakbo?
      if (isRefreshing) {
        // Hintay muna
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }).then(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;

      isRefreshing = true;

      try {
        await api.post("/auth/refresh");

        processQueue();

        return api(originalRequest);
      } catch (err) {
        processQueue(err);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
