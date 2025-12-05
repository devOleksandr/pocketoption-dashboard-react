import { TradingPage } from "~/components";
import type { Route } from "./+types/trading";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Trading - Pocket Land" },
    { name: "description", content: "Trading platform with real-time charts and trading functionality" },
  ];
}

export default function Trading() {
  return <TradingPage />;
}
