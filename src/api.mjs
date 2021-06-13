const API_HOST = "http://localhost:8080";

export async function get(path, { query } = {}) {
  const url = new URL(`${API_HOST}${path}`);
  if (query) {
    url.search = new URLSearchParams(query).toString();
  }
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function del(path) {
  await fetch(`${API_HOST}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function post(path, data) {
  const res = await fetch(`${API_HOST}${path}`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function patch(path, data) {
  const res = await fetch(`${API_HOST}${path}`, {
    method: 'PATCH',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
