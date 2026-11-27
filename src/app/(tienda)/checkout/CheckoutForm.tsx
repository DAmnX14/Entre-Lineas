"use client";

import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "@/components/useHydrated";
import { money } from "@/lib/format";
import { PROVINCES } from "@/lib/provinces";
import { COMMERCE } from "@/lib/brand";
import type { ShippingMethod } from "@/lib/cart-types";
import { useCart } from "@/components/cart/store";
import { useQuote } from "@/components/cart/useQuote";
import { CouponField } from "@/components/cart/CouponField";
import { BookCover } from "@/components/BookCover";

type Method = { id: "mercadopago" | "transferencia" | "prueba"; label: string; detail: string };

export function CheckoutForm({
  user,
  methods,
}: {
  user: { email: string; name: string; phone: string | null } | null;
  methods: Method[];
}) {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const [contact, setContact] = useState({ email: user?.email ?? "", name: user?.name ?? "", phone: user?.phone ?? "", dni: "" });
  const [address, setAddress] = useState({ street: "", number: "", floor: "", city: "", province: "Ciudad Autónoma de Buenos Aires", postalCode: "" });
  const [chosenMethod, setMethod] = useState<ShippingMethod | null>(null);
  const [billing, setBilling] = useState<{ type: "consumidor_final" | "factura_a"; name: string; cuit: string; address: string }>({
    type: "consumidor_final",
    name: "",
    cuit: "",
    address: "",
  });
  const [payment, setPayment] = useState<Method["id"]>(methods[0]?.id ?? "transferencia");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const cp = address.postalCode.replace(/\D/g, "").length >= 4 ? address.postalCode : "";
  const { quote } = useQuote({ shippingMethod: chosenMethod, postalCode: cp });
  const mounted = useHydrated();
  // Si cambia el código postal y la opción elegida deja de existir, se descarta.
  const method = quote && chosenMethod && !quote.shippingOptions.some((o) => o.method === chosenMethod) ? null : chosenMethod;

  if (!mounted) return <p className="py-20 text-center text-ink-soft">Preparando el checkout…</p>;
  if (lines.length === 0)
    return (
      <div className="py-16">
        <p className="font-hand text-4xl text-ink-soft">No hay nada en tu carrito.</p>
        <Link href="/libros" className="btn btn-primary mt-6">
          Ver los libros
        </Link>
      </div>
    );

  const transferDiscount =
    payment === "transferencia" && quote ? Math.round(((quote.subtotal - quote.discount) * COMMERCE.bankTransfer.discountPercent) / 100) : 0;
  const total = quote ? quote.subtotal - quote.discount - transferDiscount + quote.shippingCost : 0;
  const needsAddress = quote?.hasPhysical && method !== "retiro";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (quote?.hasPhysical && !method) {
      setError("Elegí cómo querés recibir el pedido.");
      return;
    }
    setSending(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines,
        coupon,
        contact,
        shippingMethod: method,
        address: needsAddress ? address : cp ? address : null,
        billing,
        paymentMethod: payment,
        notes,
        password: createAccount ? password : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No pudimos crear el pedido. Revisá los datos e intentá de nuevo.");
      setSending(false);
      return;
    }
    clear();
    window.location.href = data.redirect;
  }

  const c = (k: keyof typeof contact) => ({ value: contact[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, [k]: e.target.value }) });
  const a = (k: keyof typeof address) => ({
    value: address[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddress({ ...address, [k]: e.target.value }),
  });

  return (
    <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]" noValidate={false}>
      <div className="space-y-10">
        <section aria-labelledby="h-contacto">
          <h2 id="h-contacto" className="text-2xl">
            Tus datos
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">
                Correo electrónico
              </label>
              <input id="email" type="email" required autoComplete="email" className="field" {...c("email")} />
              <p className="mt-1 text-xs text-ink-soft">Ahí te enviamos la confirmación y, si compraste PDF, los enlaces de descarga.</p>
            </div>
            <div>
              <label className="label" htmlFor="name">
                Nombre y apellido
              </label>
              <input id="name" required autoComplete="name" className="field" {...c("name")} />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Teléfono
              </label>
              <input id="phone" type="tel" required autoComplete="tel" className="field" placeholder="11 2345 6789" {...c("phone")} />
            </div>
            <div>
              <label className="label" htmlFor="dni">
                DNI <span className="font-normal text-ink-soft">(opcional)</span>
              </label>
              <input id="dni" inputMode="numeric" className="field" {...c("dni")} />
            </div>
          </div>
          {!user && (
            <div className="mt-4 rounded-lg bg-cream p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" className="accent-clay" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                Crear una cuenta para ver mis pedidos y descargas
              </label>
              {createAccount && (
                <div className="mt-3">
                  <label className="label" htmlFor="pw">
                    Contraseña (mínimo 8 caracteres)
                  </label>
                  <input id="pw" type="password" minLength={8} autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
              <p className="mt-2 text-xs text-ink-soft">
                ¿Ya tenés cuenta?{" "}
                <Link href="/ingresar?next=/checkout" className="link">
                  Ingresá
                </Link>
              </p>
            </div>
          )}
        </section>

        {quote?.hasPhysical && (
          <section aria-labelledby="h-envio">
            <h2 id="h-envio" className="text-2xl">
              Envío
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Podés enviarlo directo a la persona que lo recibe. El paquete no lleva precios.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="cp">
                  Código postal
                </label>
                <input id="cp" required inputMode="numeric" autoComplete="postal-code" className="field" placeholder="1414" {...a("postalCode")} />
              </div>
              <div className="sm:col-span-4">
                <label className="label" htmlFor="prov">
                  Provincia
                </label>
                <select id="prov" className="field" {...a("province")}>
                  {PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="mt-5 space-y-2">
              <legend className="label">Forma de entrega</legend>
              {quote.shippingOptions.map((o) => (
                <label
                  key={o.method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${method === o.method ? "border-ink bg-cream" : "border-line bg-cream/50"}`}
                >
                  <input type="radio" name="ship" className="accent-clay" checked={method === o.method} onChange={() => setMethod(o.method)} />
                  <span className="flex-1">
                    <span className="block font-semibold">{o.label}</span>
                    <span className="text-sm text-ink-soft">{o.detail}</span>
                  </span>
                  <span className="font-semibold">{o.cost === 0 ? "Sin cargo" : money(o.cost)}</span>
                </label>
              ))}
              {!cp && <p className="text-sm text-ink-soft">Escribí tu código postal para ver las opciones de envío a domicilio y sucursal.</p>}
            </fieldset>

            {needsAddress && method && (
              <div className="mt-5 grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label className="label" htmlFor="street">
                    Calle
                  </label>
                  <input id="street" required autoComplete="address-line1" className="field" {...a("street")} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="num">
                    Número
                  </label>
                  <input id="num" required className="field" {...a("number")} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="floor">
                    Piso y depto. <span className="font-normal text-ink-soft">(opcional)</span>
                  </label>
                  <input id="floor" autoComplete="address-line2" className="field" {...a("floor")} />
                </div>
                <div className="sm:col-span-4">
                  <label className="label" htmlFor="city">
                    Localidad
                  </label>
                  <input id="city" required autoComplete="address-level2" className="field" {...a("city")} />
                </div>
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="h-fact">
          <h2 id="h-fact" className="text-2xl">
            Facturación
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["consumidor_final", "Consumidor final"],
                ["factura_a", "Factura A"],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${billing.type === k ? "border-ink bg-ink text-cream" : "border-line bg-cream"}`}>
                <input type="radio" className="sr-only" name="bill" checked={billing.type === k} onChange={() => setBilling({ ...billing, type: k })} />
                {l}
              </label>
            ))}
          </div>
          {billing.type === "factura_a" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="rs">
                  Razón social
                </label>
                <input id="rs" className="field" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="cuit">
                  CUIT
                </label>
                <input id="cuit" className="field" inputMode="numeric" value={billing.cuit} onChange={(e) => setBilling({ ...billing, cuit: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="baddr">
                  Domicilio fiscal
                </label>
                <input id="baddr" className="field" value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} />
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="h-pago">
          <h2 id="h-pago" className="text-2xl">
            Pago
          </h2>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Medio de pago</legend>
            {methods.map((m) => (
              <label key={m.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${payment === m.id ? "border-ink bg-cream" : "border-line bg-cream/50"}`}>
                <input type="radio" name="pay" className="mt-1 accent-clay" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="text-sm text-ink-soft">{m.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-5">
            <label className="label" htmlFor="notes">
              Notas para el pedido <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <textarea id="notes" className="field min-h-20" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej.: es una sorpresa, no tocar timbre antes de las 18." />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-xl bg-cream p-6 lg:sticky lg:top-24">
        <h2 className="text-2xl">Tu pedido</h2>
        <ul className="mt-4 divide-y divide-line">
          {quote?.lines.map((l) => (
            <li key={l.id} className="flex gap-3 py-3">
              <div className="w-11 shrink-0">
                <BookCover title={l.covers[0]?.title ?? l.title} category={l.covers[0]?.category ?? "personales"} image={l.covers[0]?.image} size="sm" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold leading-snug">{l.title}</p>
                <p className="text-ink-soft">
                  {l.qty} × {l.format === "pdf" ? "PDF" : "Físico"}
                  {l.personalization?.dedication ? " · con dedicatoria" : ""}
                </p>
              </div>
              <p className="text-sm font-semibold">{money(l.total)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <CouponField message={quote?.couponMessage ?? null} valid={!!quote?.couponValid} />
        </div>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{quote ? money(quote.subtotal) : "—"}</dd>
          </div>
          {quote && quote.discount > 0 && (
            <div className="flex justify-between text-olive">
              <dt>Cupón</dt>
              <dd>−{money(quote.discount)}</dd>
            </div>
          )}
          {transferDiscount > 0 && (
            <div className="flex justify-between text-olive">
              <dt>Descuento por transferencia</dt>
              <dd>−{money(transferDiscount)}</dd>
            </div>
          )}
          {quote?.hasPhysical && (
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{method ? (quote.shippingCost === 0 ? "Sin cargo" : money(quote.shippingCost)) : "Elegí una opción"}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>Total</dt>
            <dd>{quote ? money(total) : "—"}</dd>
          </div>
        </dl>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose/60 p-3 text-sm">
            {error}
          </p>
        )}
        <button className="btn btn-primary mt-5 w-full text-base" disabled={sending || !quote || quote.errors.length > 0}>
          {sending ? "Creando tu pedido…" : payment === "mercadopago" ? "Pagar con Mercado Pago" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-soft">Tus datos viajan cifrados. No guardamos datos de tarjetas.</p>
      </aside>
    </form>
  );
}
