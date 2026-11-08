# Prototype Instructions

## Agency responsibilities and expansion

- Service planning owns policy decisions, requirement coverage and complete user journeys. UI/UX owns customer flows, responsive layouts and clear Korean copy. Service operations owns administrator actions, exceptions and reconciliation. Functional/data engineering owns shared browser state and transaction rules. Independent QA reviews the implementation, runs regression and edge-case harnesses, and verifies fixes before documentation.
- These are working roles for the prototype, not claims that a staffed external company or production backend exists. Run independent QA after implementation roles complete; do not equate an implementer's tests with independent review.
- The latest owner requirement replaces money-based guaranteed ceiling awards with opening-based probability gauges. Preserve old awards as history and block new money-based guaranteed claims. Grade means the drawn product grade; each grade has a configurable opening-count start condition, gauge gain, percentage-point boost and boost-use count. Full gauges apply from the next opening. Apply one ready grade per opening (A to E priority), preserve other ready gauges, and reset the applied gauge after its uses are exhausted.
- Charging creates withdrawable Pay (wallet.paid). Product relinquishment creates non-withdrawable Points (wallet.bonus), at a default 60 percent with per-product percentage overrides and award-time snapshots. Legacy cash is migrated once to Points. All product return paths must never create Pay. Pay withdrawal is a local request/reservation/approval-or-rejection flow; actual bank transfer, identity verification, PG and outbound messages remain developer integration work. Ordinary unrequested wins expire after 240 hours into Points; old guaranteed rewards keep their recorded exceptions.
- Produce the customer/operator guide and developer handoff only after the final implementation, review, fixes and rerun of the harness are complete. Keep guides consistent with actual behavior and include every exposed menu.

## Client meeting requirements

- Address the owner as 하하랩 대표님.
- Customer UI should use normal service language and natural menu placement. Do not expose admin links or a meeting/demo shortcut bar. Keep blank-input operation for client presentations, while identifying example wins and actual integration limits in their relevant context.
- Every admin menu must explain its purpose, how to use it, and its practical use in plain Korean. Avoid generic data-management wording; distinguish connected demo behavior from record-only features.
- This is a client-meeting demo: empty signup, login and payment forms must remain usable. No real database, payment or message delivery is required.
- User and admin must share browser-persisted data for prices, probability tiers, charging, refunds, inventory, orders and published content.
- Probability percentages must show expected waiting count and cumulative chance without claiming guaranteed wins.
- Clearly label other-member sample wins. Never present generated activity as real customers or independently verified fairness.
- Preserve the selected dark navy/purple design. Keep GitHub Pages compatibility and document actual implemented operations separately from planned requirements.
- My page should show the member's point balance, benefits, stored products and delivery progress before navigation. Use a compact account sidebar on desktop and place the menu below the summary on mobile. Personal opening history must be separate from the public winner feed.
- Do not request a contact number again during box checkout; use the member profile. A successful purchase should play a skippable box-opening animation before revealing the already-stored results, without drawing or charging again. Respect reduced-motion preferences.
- Keep admin navigation minimal: no overview, diagnostics, backup or analytics menus. Preserve essential box/probability/product, point charging/refund, order/member and content/policy management. Lists show essential columns first. Per the latest owner instruction, full stored information must expand immediately below the selected row through an explicit 상세 보기 control; keep readable Korean labels and structured probability tables in the expanded area.
- Image registration uses file uploads, never image URL text fields. Box representative/detail images are hidden in admin list rows and managed in edit dialogs. Uploaded box detail images and product images appear on the customer box purchase/detail screen alongside individual product odds.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Opening gauge and balance clarity

- Use 천장 게이지 and 확률 강화 in visible navigation. Show qualifying opening counts, current gauge, per-grade gain, available boost uses and the exact final probability before purchase. Do not show the retired cumulative-payment guaranteed-award workflow as an active feature.
- Separate Pay from Points in every balance, purchase, conversion and ledger view. Points are used first, then Pay. Product-return dialogs show base price × saved percentage = Points and clearly state non-withdrawable status. Pay cashout reserves Pay once and returns it once on rejection/cancellation.
- Administrator layouts must remain usable at laptop sizes (1366×768, 1280×720, 1024×768): preserve Korean word boundaries, contain wide tables within scroll regions, allow buttons to grow with text, and keep long dialogs scrollable within the viewport.
- Keep historical guaranteed rewards and financial transactions readable without rewriting their original records. New gauge progress starts from new successful openings after migration; do not retrospectively credit old openings.

## Latest hardening scope

- Strengthen the previously audited gaps and browser-side input, consent, file, storage and transaction checks. Do not change box-grade design or opening animation in this revision.
- Historical guaranteed-reward categories and product mappings remain stored for audit only. Active ceiling settings now control opening-based grade gauges and probability boosts. Never silently substitute another product on stockout.
- Keep empty-input presentation flows as the default. Administrators may enable strict required-consent validation; preserve the actual selections and the notice shown at the time. Clearly distinguish browser validation from server authentication and production security.
- Stockout substitutions require the member to accept a named replacement; preserve the original draw, price and probability records. Update the service/operator and developer guides only after integration QA, then publish the verified build.

## Current revision delivery

- Implement Pay/Points separation, configurable product-to-Points percentage, Pay withdrawal and the opening-based probability gauge as one connected user/admin flow. Keep box grade design and the opening animation unchanged. Update both handoff guides after integrated QA. Public-screen verification remains deferred until the owner requests it.
