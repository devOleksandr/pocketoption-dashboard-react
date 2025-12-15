import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("trading", "routes/trading.tsx"),
    route("cabinet/withdrawal", "routes/withdrawal.tsx"),
    route("cabinet/balance-history", "routes/balance-history.tsx"),
] satisfies RouteConfig;
