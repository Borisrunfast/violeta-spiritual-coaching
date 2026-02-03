import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import netlifyIdentity from "netlify-identity-widget";
import ProductTable from "../components/admin/ProductTable.jsx";
import ProductEditor from "../components/admin/ProductEditor.jsx";
import PricePanel from "../components/admin/PricePanel.jsx";
import { listProducts, updateProduct, createPrice, setDefaultPrice } from "../api/admin.js";

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase();

const Guard = ({ title, description, actionLabel, onAction }) => (
  <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
    <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
    <p className="mt-3 text-sm text-slate-600">{description}</p>
    <button
      type="button"
      className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      onClick={onAction}
    >
      {actionLabel}
    </button>
  </div>
);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [creatingPrice, setCreatingPrice] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const isOwner = useMemo(() => {
    if (!user) return false;
    const emailMatch = user.email?.toLowerCase() === adminEmail;
    const hasRole = Array.isArray(user.app_metadata?.roles) && user.app_metadata.roles.includes("owner");
    return emailMatch || hasRole;
  }, [user]);

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  useEffect(() => {
    // FIX: Determine the correct URL for Identity service
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // Use the live site URL from env if local, otherwise use the current origin
    const siteUrl = isLocal ? import.meta.env.VITE_SITE_URL : window.location.origin;

    // Initialize with the correct API URL
    netlifyIdentity.init({
      APIUrl: `${siteUrl}/.netlify/identity`,
    });

    const current = netlifyIdentity.currentUser();
    if (current) setUser(current);

    const handleLogin = (identityUser) => {
      setUser(identityUser);
      netlifyIdentity.close();
    };
    const handleLogout = () => {
      setUser(null);
      setProducts([]);
      setSelectedId(null);
    };

    netlifyIdentity.on("login", handleLogin);
    netlifyIdentity.on("logout", handleLogout);

    return () => {
      netlifyIdentity.off("login", handleLogin);
      netlifyIdentity.off("logout", handleLogout);
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!user || !isOwner) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.jwt();
      const response = await listProducts({ includePrices: true, limit: 25 }, { token });
      const data = response.data || [];
      setProducts(data);
      if (data.length) {
        setSelectedId((current) => (current && data.some((p) => p.id === current) ? current : data[0].id));
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isOwner]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const processedProducts = useMemo(
    () =>
      products.map((product) => {
        let descriptionJson = {};
        let descriptionError = "";
        if (product.description) {
          try {
            descriptionJson = JSON.parse(product.description);
          } catch (err) {
            descriptionError = err.message;
          }
        }
        return { ...product, descriptionJson, descriptionError };
      }),
    [products]
  );

  const selectedProduct =
    processedProducts.find((product) => product.id === selectedId) || processedProducts[0] || null;

  const handleSaveProduct = async (payload) => {
    setSavingProduct(true);
    try {
      const token = await user.jwt();
      const { product } = await updateProduct(payload, { token });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? product : item)));
      showToast("success", "Product updated");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCreatePrice = async (payload) => {
    setCreatingPrice(true);
    try {
      const token = await user.jwt();
      const { price } = await createPrice(payload, { token });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === payload.productId ? { ...product, prices: [price, ...(product.prices || [])] } : product
        )
      );
      showToast("success", "Price created");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setCreatingPrice(false);
    }
  };

  const handleSetDefaultPrice = async ({ productId, priceId }) => {
    setSettingDefault(true);
    try {
      const token = await user.jwt();
      const { product } = await setDefaultPrice({ productId, priceId }, { token });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? product : item)));
      showToast("success", "Default price updated");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSettingDefault(false);
    }
  };

  if (!user) {
    return (
      <Guard
        title="Owner access only"
        description="Sign in with your Netlify Identity owner account to manage products."
        actionLabel="Sign in"
        onAction={() => netlifyIdentity.open()}
      />
    );
  }

  if (!isOwner) {
    return (
      <Guard
        title="Forbidden"
        description={`You are signed in as ${user.email}, but this account is not authorized.`}
        actionLabel="Sign out"
        onAction={() => netlifyIdentity.logout()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Owner portal</p>
          <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500">Manage Stripe products, metadata, and prices.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={fetchProducts}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            onClick={() => netlifyIdentity.logout()}
          >
            Sign out
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <ProductTable
            products={processedProducts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            error={error}
            onRefresh={fetchProducts}
          />
          <ProductEditor product={selectedProduct} onSave={handleSaveProduct} saving={savingProduct} />
        </div>
        <div className="lg:col-span-2">
          <PricePanel
            product={selectedProduct}
            onCreatePrice={handleCreatePrice}
            onSetDefaultPrice={handleSetDefaultPrice}
            creating={creatingPrice}
            settingDefault={settingDefault}
          />
        </div>
      </div>
    </div>
  );
}

