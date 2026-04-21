"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import type { Product, Role } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface InventoryManagerProps {
  initialProducts: Product[];
  role: Role;
  barbershopId: string;
}

const emptyForm = {
  name: "",
  category: "",
  purchase_price: "",
  sale_price: "",
  stock: "",
  min_stock: "5",
};

const CATEGORIES = [
  "Cuidado capilar",
  "Estilizantes",
  "Barba",
  "Color",
  "Herramientas",
  "Accesorios",
  "Otros",
];

export default function InventoryManager({
  initialProducts,
  role,
  barbershopId,
}: InventoryManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [saleQty, setSaleQty] = useState("1");
  const [saleLoading, setSaleLoading] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      purchase_price: product.purchase_price.toString(),
      sale_price: product.sale_price.toString(),
      stock: product.stock.toString(),
      min_stock: product.min_stock.toString(),
    });
    setShowModal(true);
  }

  async function handleSave() {
    setLoading(true);
    const payload = {
      name: form.name,
      category: form.category,
      purchase_price: parseFloat(form.purchase_price),
      sale_price: parseFloat(form.sale_price),
      stock: parseInt(form.stock),
      min_stock: parseInt(form.min_stock),
      barbershop_id: barbershopId,
    };

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (editingId) {
      const { data } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (data) setProducts((prev) => prev.map((p) => (p.id === editingId ? data : p)));
    } else {
      const { data } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
      if (data) setProducts((prev) => [data, ...prev]);
    }
    setShowModal(false);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function openSale(product: Product) {
    setSaleProduct(product);
    setSaleQty("1");
    setShowSaleModal(true);
  }

  async function handleSale() {
    if (!saleProduct) return;
    const qty = parseInt(saleQty);
    if (isNaN(qty) || qty < 1 || qty > saleProduct.stock) return;

    setSaleLoading(true);
    const total = saleProduct.sale_price * qty;

    const transaction = {
      barbershop_id: barbershopId,
      type: "income" as const,
      amount: total,
      description: `Venta: ${saleProduct.name} x${qty}`,
      category: "Ventas",
      client_id: null,
      date: new Date().toISOString().split("T")[0],
      created_by: null,
    };

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await Promise.all([
      supabase
        .from("products")
        .update({ stock: saleProduct.stock - qty })
        .eq("id", saleProduct.id),
      supabase.from("transactions").insert(transaction),
    ]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === saleProduct.id ? { ...p, stock: p.stock - qty } : p
      )
    );

    setSaleLoading(false);
    setShowSaleModal(false);
    setSuccessMsg(`Venta de ${saleProduct.name} x${qty} registrada — $${total}`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            {role === "barbero" ? "Inventario — Ventas" : "Inventario"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
            {products.length} productos
            {lowStockCount > 0 && (
              <span className="badge badge-red" style={{ marginLeft: "0.5rem" }}>
                <AlertTriangle size={10} style={{ marginRight: "0.25rem" }} />
                {lowStockCount} con stock bajo
              </span>
            )}
          </p>
        </div>
        {role === "admin" && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            Agregar producto
          </button>
        )}
      </div>

      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
          }}
        >
          <CheckCircle2 size={15} />
          {successMsg}
        </div>
      )}

      {role === "barbero" && (
        <div
          style={{
            borderRadius: "0.5rem",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            background: "#dbeafe",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
          }}
        >
          Haz clic en "Registrar venta" para descontar stock y crear una transacción automáticamente.
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search
          size={15}
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
        />
        <input
          type="text"
          placeholder="Buscar producto o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.25rem" }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                {role === "admin" && <th>Costo</th>}
                <th>Precio venta</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 6 : 5} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td>
                      <span className="badge badge-blue">{product.category}</span>
                    </td>
                    {role === "admin" && (
                      <td style={{ color: "#6b7280" }}>${product.purchase_price}</td>
                    )}
                    <td style={{ color: "#0a0a0a", fontWeight: 600 }}>
                      ${product.sale_price}
                    </td>
                    <td>
                      <span
                        className={cn(
                          "badge",
                          product.stock <= product.min_stock ? "badge-red" : "badge-green"
                        )}
                      >
                        {product.stock <= product.min_stock && (
                          <AlertTriangle size={10} style={{ marginRight: "0.25rem" }} />
                        )}
                        {product.stock} uds.
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        {role === "barbero" ? (
                          <button
                            onClick={() => openSale(product)}
                            disabled={product.stock === 0}
                            className="btn-primary"
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.375rem 0.75rem",
                              opacity: product.stock === 0 ? 0.4 : 1,
                            }}
                          >
                            <ShoppingCart size={13} />
                            Registrar venta
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(product)}
                              className="btn-ghost"
                              style={{ padding: "0.375rem 0.625rem" }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="btn-ghost"
                              style={{ padding: "0.375rem 0.625rem", color: "#dc2626" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && role === "admin" && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Nombre *</label>
                <input
                  type="text"
                  placeholder="Shampoo profesional"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Categoría *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Precio compra ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Precio venta ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Stock actual</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Stock mínimo</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={form.min_stock}
                    onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !form.name || !form.category}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaleModal && saleProduct && (
        <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Registrar venta</h2>
              <button onClick={() => setShowSaleModal(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "1rem",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>{saleProduct.name}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.125rem 0 0" }}>
                    {saleProduct.category}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, color: "#0a0a0a", margin: 0 }}>${saleProduct.sale_price}</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Stock: {saleProduct.stock}</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Cantidad</label>
              <input
                type="number"
                value={saleQty}
                onChange={(e) => setSaleQty(e.target.value)}
                min="1"
                max={saleProduct.stock}
              />
            </div>

            <div
              style={{
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Total a cobrar</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0a0a0a" }}>
                ${(saleProduct.sale_price * (parseInt(saleQty) || 0)).toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowSaleModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleSale}
                disabled={
                  saleLoading ||
                  !saleQty ||
                  parseInt(saleQty) < 1 ||
                  parseInt(saleQty) > saleProduct.stock
                }
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <ShoppingCart size={15} />
                {saleLoading ? "Registrando..." : "Confirmar venta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
