export async function fetchSomeData() {
  const response = await fetch('https://api.example.com/data');
  return response.json();
}