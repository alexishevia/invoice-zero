let credentials = {
  url: localStorage.getItem("apiURL"),
  username: localStorage.getItem("apiUsername"),
  password: localStorage.getItem("apiPassword"),
};

export function set({ url, username, password }) {
  credentials = { url, username, password };
  localStorage.setItem("apiURL", url);
  localStorage.setItem("apiUsername", username);
  localStorage.setItem("apiPassword", password);
}

export function get() {
  return credentials;
}
