# HmarahHUB

A browser-only configuration inspection dashboard. It reads files selected by the user locally in their browser and reports protocol, transport, TLS classification, and whether an SNI/server-name field is present.

## Privacy
- No backend, analytics, upload endpoint, remote source collector, or credential storage.
- Raw configuration text is not displayed in the UI.
- CSV export contains only a sanitized structural inventory; it omits addresses, ports, UUIDs, passwords, and complete connection URIs.
- Do not commit private configuration files to this public repository.

## Supported input formats
- URI lines: VLESS, VMess, Trojan, Shadowsocks, SOCKS, HTTP(S).
- Xray-style JSON outbounds.
- Base64-wrapped text subscriptions provided by the user as a local file.

## Limitations
This is a structural inspector, not a connection tester. A detected TLS or SNI field does not prove that a certificate is valid, that SNI matches the certificate, or that a remote service is reachable. The inspector does not rewrite server destinations, generate working proxy subscriptions, or scrape public repositories for third-party endpoints.

## Deploy to GitHub Pages
1. Open Settings → Pages in the repository.
2. Under Build and deployment, choose GitHub Actions.
3. Push to the main branch; the workflow in .github/workflows/pages.yml publishes the static dashboard.

The dashboard can also be opened locally from index.html.