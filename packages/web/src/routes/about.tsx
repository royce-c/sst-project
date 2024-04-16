import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const [data, setData] = useState(null);

  const useTest = async () => {
    const { getToken } = useKindeAuth();
    const token = await getToken();

    const headers = new Headers();
    headers.append("Authorization", token || "");
    headers.append("Content-Type", "application/json");

    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/csharp", {
      method: "GET",
      headers: headers,
    });
    console.log(res);
  };

  useTest();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          import.meta.env.VITE_APP_API_URL + "/csharp"
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
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
