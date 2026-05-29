import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (res) => res,
  (error) => {
    const message= error.response?.data?.message || error.message || "An unexpected error occurred while making the request with axios.";
  
  return Promise.reject(new Error(message));
  }
)


export default apiClient;
