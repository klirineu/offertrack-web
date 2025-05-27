import axios from "axios";
// https://fastspeed.site
// http://192.168.100.6:3001
const api = axios.create({
  baseURL: "https://fastspeed.site",
});

export default api;
