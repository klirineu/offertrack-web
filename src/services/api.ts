import axios from "axios";
// https://production-web.up.railway.app
// http://192.168.100.6:3001
const api = axios.create({
  baseURL: "https://production-web.up.railway.app",
});

export default api;
