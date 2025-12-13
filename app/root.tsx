import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles/main.scss";

export const links: Route.LinksFunction = () => [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
    },
    // Font Awesome
    {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    },
    {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
    },
    // Vendor CSS files
    {
        rel: "stylesheet",
        href: "/css/vendors.animatecss.min.css",
    },
    {
        rel: "stylesheet",
        href: "/css/vendors.bootstrap-select.min.css",
    },
    {
        rel: "stylesheet",
        href: "/css/vendors.daterangepicker.min.css",
    },
    // Main platform CSS
    {
        rel: "stylesheet",
        href: "/css/main.css",
    },
    // Desktop CSS (contains layout styles)
    {
        rel: "stylesheet",
        href: "/css/desktop.min.css",
    },
    // Dark theme CSS
    {
        rel: "stylesheet",
        href: "/css/desktop.theme-dark-blue.min.css",
    },
];

export default function Root() {
    return (
        <html lang="en" className="theme-dark-blue">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, user-scalable=yes, viewport-fit=cover" />
                <meta name="theme-color" content="#1F1F23" />
                <meta name="supported-color-schemes" content="light dark" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <Meta />
                <Links />
            </head>
            <body className="is-chart is-chart-demo is-quick has-bg-image is-try-demo is-pc-version">
                <div className="wrapper">
                    <div className="wrapper__top">
                        <Outlet />
                    </div>
                </div>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(() => {
  try {
    const docEl = document.documentElement;
    docEl.style.overflowX = 'hidden';
    let startX = 0, startY = 0;
    window.addEventListener('touchstart', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      // Allow horizontal gestures inside whitelisted elements
      const path = (e.composedPath && e.composedPath()) || [];
      for (const node of path) {
        if (node && node.getAttribute && node.getAttribute('data-allow-horizontal') === 'true') {
          return; // skip prevention for chart area
        }
      }
      const t = e.touches && e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Block horizontal page panning (iOS rubber-banding / back-swipe hint)
        e.preventDefault();
      }
    }, { passive: false });
  } catch {}
})();`
                    }}
                />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="p-4">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
