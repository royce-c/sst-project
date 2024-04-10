import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from 'react';

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(import.meta.env.VITE_APP_API_URL + "/cs");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>About Page</h1>
      {data ? (
        <div>
          <p>Welcome to the About page!</p>
          <p>{JSON.stringify(data)}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
