# Prototype Instructions

## Agency responsibilities and expansion

- Service planning owns policy decisions, requirement coverage and complete user journeys. UI/UX owns customer flows, responsive layouts and clear Korean copy. Service operations owns administrator actions, exceptions and reconciliation. Functional/data engineering owns shared browser state and transaction rules. Independent QA reviews the implementation, runs regression and edge-case harnesses, and verifies fixes before documentation.
- These are working roles for the prototype, not claims that a staffed external company or production backend exists. Run independent QA after implementation roles complete; do not equate an implementer's tests with independent review.
- Implement approved-charge-based independent B 10,000,000 KRW and A 40,000,000 KRW reward tracks, preserving historical transactions; on each newly confirmed reward receipt reset only that grade to zero, including any excess credit. Ordinary wins never reset either track. Exclude free grants and repeated spending from charge credit.
- Default new item conversion is 60 percent, with item-specific overrides captured at award. Conversion cash is usable only within this prototype, with no bank withdrawal. Ordinary unrequested wins expire after 240 hours into bonus points; pity rewards are excluded. Actual background scheduling, identity verification, PG and outbound notifications remain developer integration work.
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

## Reward menu clarity

- Use 천장 보상, 확정보상 and 천장 게이지 in visible customer and administrator navigation, per the latest owner instruction. Explain that actual approved point-charge payments, less refunds, count toward rewards; box spending is not counted twice.
- Organize reward administration by member progress, reward criteria, payout history and post-refund review. Default to member progress; separate payout from amount correction. Show remaining amounts and available rewards before internal terminology. Preserve independent A/B calculations and recorded transaction history. Latest requirement supersedes the earlier carryover recommendation: a confirmed reward receipt resets that grade to zero without carrying excess to the next cycle; the other grade remains unchanged.
- Administrator layouts must remain usable at laptop sizes (1366×768, 1280×720, 1024×768): preserve Korean word boundaries, contain wide tables within scroll regions, allow buttons to grow with text, and keep long dialogs scrollable within the viewport. Avoid duplicated help pushing the primary work below the first screen.
- Novice operators should be able to complete tasks using the guide: explain prerequisites, input units, required values, save result, customer-facing reflection and failure recovery. Keep list rows compact; expand long product and transaction details on demand without navigating away.

## Latest hardening scope

- Strengthen the previously audited gaps and browser-side input, consent, file, storage and transaction checks. Do not change box-grade design or opening animation in this revision.
- Reward categories and A~E rules are configurable; A/B remain enabled defaults. Each grade/category has an explicit designated product. Never silently substitute another product on stockout. Preserve existing cycle thresholds and historical awards.
- Keep empty-input presentation flows as the default. Administrators may enable strict required-consent validation; preserve the actual selections and the notice shown at the time. Clearly distinguish browser validation from server authentication and production security.
- Stockout substitutions require the member to accept a named replacement; preserve the original draw, price and probability records. Update the service/operator and developer guides only after integration QA, then publish the verified build.
