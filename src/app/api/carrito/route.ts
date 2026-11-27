import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/pricing";
import type { CartLine, ShippingMethod } from "@/lib/cart-types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    lines?: CartLine[];
    coupon?: string;
    shippingMethod?: ShippingMethod;
    postalCode?: string;
  };
  const quote = quoteCart(Array.isArray(body.lines) ? body.lines : [], {
    couponCode: body.coupon,
    shippingMethod: body.shippingMethod,
    postalCode: body.postalCode,
  });
  return NextResponse.json(quote);
}
