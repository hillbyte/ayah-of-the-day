export async function getRandomAyah() {
    try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ayah:', error);
        return null;
    }
}

