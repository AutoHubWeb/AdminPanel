import { useState, useEffect } from "react";
import { vpsApi } from "@/lib/api";

export default function TestVpsApi() {
  const [vpsData, setVpsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVpsData = async () => {
      try {
        setLoading(true);
        const response = await vpsApi.list();
        setVpsData(response.data);
      } catch (err) {
        setError("Failed to fetch VPS data");
        console.error("Error fetching VPS data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVpsData();
  }, []);

  if (loading) return <div>Loading VPS data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>VPS API Response</h2>
      <pre>{JSON.stringify(vpsData, null, 2)}</pre>
    </div>
  );
}
