export type OrderStatus = "pendiente" | "pagado" | "en_preparacion" | "enviado" | "entregado" | "cancelado";
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: "Pendiente de pago",
  pagado: "Pagado",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
