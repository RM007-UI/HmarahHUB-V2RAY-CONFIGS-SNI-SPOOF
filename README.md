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

## One-time GitHub Pages setup
The repository's GitHub connection can push source files and workflows, but its Actions token cannot create the Pages site. A repository administrator must enable Pages once:
1. Open **Settings → Pages**: https://github.com/RM007-UI/HmarahHUB-V2RAY-CONFIGS-SNI-SPOOF/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. The next successful run of **Deploy HmarahHUB to GitHub Pages** publishes the site.

The dashboard can also be opened locally from `index.html`.