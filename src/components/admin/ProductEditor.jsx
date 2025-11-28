import { useEffect, useMemo, useState } from "react";

const prettyJson = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
};

const parseJson = (value) => {
  if (!value.trim()) return {};
  return JSON.parse(value);
};

const normalizeImages = (value) =>
  value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

export default function ProductEditor({ product, onSave, saving }) {
  const [name, setName] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [contentJson, setContentJson] = useState("{}");
  const [metadataJson, setMetadataJson] = useState("{}");
  const [contentError, setContentError] = useState("");
  const [metadataError, setMetadataError] = useState("");

  useEffect(() => {
    if (!product) return;
    setName(product.name || "");
    setImagesText((product.images || []).join(", "));
    setContentJson(prettyJson(product.descriptionJson || {}));
    setMetadataJson(prettyJson(product.metadata || {}));
    setContentError(product.descriptionError || "");
    setMetadataError("");
  }, [product]);

  const hasSelection = Boolean(product);

  const selectedWarning = useMemo(() => {
    if (!product) return "";
    if (product.descriptionError) {
      return `Invalid JSON detected: ${product.descriptionError}`;
    }
    return "";
  }, [product]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!product || saving) return;

    let parsedDescription;
    let parsedMetadata;

    try {
      parsedDescription = parseJson(contentJson);
      if (parsedDescription == null || typeof parsedDescription !== "object" || Array.isArray(parsedDescription)) {
        throw new Error("Content JSON must be an object");
      }
      setContentError("");
    } catch (err) {
      setContentError(err.message);
      return;
    }

    try {
      parsedMetadata = parseJson(metadataJson);
      if (parsedMetadata == null || typeof parsedMetadata !== "object" || Array.isArray(parsedMetadata)) {
        throw new Error("Metadata JSON must be an object");
      }
      setMetadataError("");
    } catch (err) {
      setMetadataError(err.message);
      return;
    }

    await onSave({
      productId: product.id,
      name,
      images: normalizeImages(imagesText),
      descriptionJson: parsedDescription,
      metadata: parsedMetadata,
    });
  };

  if (!hasSelection) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-6 text-center text-sm text-slate-500">
        Select a product to edit its metadata.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Product editor</h2>
        <p className="text-sm text-slate-500">Update storefront content stored in Stripe.</p>
        {selectedWarning ? (
          <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{selectedWarning}</p>
        ) : null}
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Name</span>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Images (comma-separated URLs)</span>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder="https://example.com/one.jpg, https://example.com/two.jpg"
        />
      </label>

      <label className="block text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Content JSON (stored in Stripe description)</span>
          {contentError && <span className="text-xs font-medium text-red-600">{contentError}</span>}
        </div>
        <textarea
          className="mt-1 h-48 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
          value={contentJson}
          onChange={(e) => setContentJson(e.target.value)}
          onBlur={() => {
            try {
              parseJson(contentJson);
              setContentError("");
            } catch (err) {
              setContentError(err.message);
            }
          }}
        />
      </label>

      <label className="block text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Metadata JSON (Stripe metadata)</span>
          {metadataError && <span className="text-xs font-medium text-red-600">{metadataError}</span>}
        </div>
        <textarea
          className="mt-1 h-40 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
          value={metadataJson}
          onChange={(e) => setMetadataJson(e.target.value)}
          onBlur={() => {
            try {
              parseJson(metadataJson);
              setMetadataError("");
            } catch (err) {
              setMetadataError(err.message);
            }
          }}
        />
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

