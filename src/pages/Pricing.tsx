import "./styles/pricing.css";

export default function Pricing() {
  return (
    <main className="pricing">
      {/* HERO */}
      <section className="pricing-hero">
        <h1>Simple pricing, aligned with responsibility</h1>
        <p className="pricing-subhead">
          Chronos pricing reflects how work is owned — not how loudly
          features are advertised.
        </p>
      </section>

      {/* TIERS */}
      <section className="pricing-tiers">
        {/* SOLO */}
        <div className="pricing-card">
          <h2>Solo</h2>
          <p className="pricing-price">$29<span>/month</span></p>
          <p className="pricing-desc">
            For individual agents managing their own transactions.
          </p>

          <ul>
            <li>Unlimited transactions</li>
            <li>Event-sourced task system</li>
            <li>Full timeline history</li>
            <li>Realtime updates</li>
            <li>Standard support</li>
          </ul>

          <button>Start using Chronos</button>
        </div>

        {/* TEAM */}
        <div className="pricing-card pricing-card--primary">
          <h2>Team</h2>
          <p className="pricing-price">$79<span>/user / month</span></p>
          <p className="pricing-desc">
            For producing teams with shared responsibility.
          </p>

          <ul>
            <li>Everything in Solo</li>
            <li>Role-based capabilities</li>
            <li>Explicit task ownership</li>
            <li>Shared timelines</li>
            <li>Priority support</li>
          </ul>

          <button>Start using Chronos</button>
        </div>

        {/* BROKERAGE */}
        <div className="pricing-card">
          <h2>Brokerage</h2>
          <p className="pricing-price">Custom</p>
          <p className="pricing-desc">
            For brokerages that require governance and auditability.
          </p>

          <ul>
            <li>Everything in Team</li>
            <li>Admin event inspector</li>
            <li>Audit-grade history</li>
            <li>Custom role policies</li>
            <li>Dedicated onboarding</li>
          </ul>

          <button>Talk to us</button>
        </div>
      </section>

      {/* FOOTNOTE */}
      <section className="pricing-footnote">
        <p>
          Chronos does not charge for automation gimmicks,
          AI add-ons, or dashboard noise.
        </p>
        <p>
          Every plan includes the same core architecture —
          immutable events, deterministic timelines, and calm execution.
        </p>
      </section>
    </main>
  );
}
