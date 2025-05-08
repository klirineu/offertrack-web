import axios from "axios";

const api = axios.create({
  baseURL: "https://production-web.up.railway.app",
});

export default api;
