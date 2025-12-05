import { TradingPage } from "~/components";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Pocket Land" },
        { name: "description", content: "Welcome to Pocket Land!" },
    ];
}

export default function Home() {
    return <TradingPage />;
}
