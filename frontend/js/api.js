async function getJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return response.json();
}
