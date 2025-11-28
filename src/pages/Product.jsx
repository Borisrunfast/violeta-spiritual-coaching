import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../api/products";

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getProductById(id).then(setP).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!p) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">{p.name}</h1>
      <p className="text-gray-700">{p.description}</p>
    </div>
  );
}
