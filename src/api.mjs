import * as credentials from "./credentials.mjs";

function baseHeaders() {
  const { username, password } = credentials.get();
  return {
    'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ":" + password),
  }
}

function buildURL(path) {
  const { url } = credentials.get();
  return new URL(path, url)
}

export async function get(path, { query } = {}) {
  const url = buildURL(path);
  if (query) {
    url.search = new URLSearchParams(query).toString();
  }
  const res = await fetch(url, { headers: baseHeaders() });
  if (!res.ok) {
    throw new Error(`failed getting ${url}`)
  }
  return res.json();
}

export async function del(path) {
  const url = buildURL(path);
  const res = await fetch(url, { method: 'DELETE', headers: baseHeaders(), });
  if (!res.ok) {
    throw new Error(`failed deleting ${url}`)
  }
}

export async function post(path, data) {
  const url = buildURL(path);
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: baseHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`failed posting to ${url}`)
  }
  return res.json();
}

export async function patch(path, data) {
  const url = buildURL(path);
  const res = await fetch(url, {
    method: 'PATCH',
    mode: 'cors',
    headers: baseHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`failed posting to ${url}`)
  }
  return res.json();
}
