const API_HOST = "http://localhost:8080";

export async function get(path) {
  const res = await fetch(`${API_HOST}${path}`, {
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
