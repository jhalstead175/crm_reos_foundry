import "./styles/landing.css";

export default function LandingPage() {
  return (
    <main className="landing">
      {/* HERO */}
      <section className="landing-hero">
        <h1>Always know where a deal stands — and why.</h1>

        <p className="landing-subhead">
          Most real estate systems track statuses.
          <br />
          Chronos records what actually happens.
        </p>

        <p className="landing-support">
          A calm operating system for real estate transactions,
          built on events instead of guesswork.
        </p>

        <button className="landing-cta">
          Start using Chronos
        </button>
      </section>

      {/* PROBLEM */}
      <section className="landing-section">
        <h2>Why CRMs feel chaotic</h2>
        <p>
          Statuses drift. Timelines fragment. Tasks linger without
          context. Responsibility becomes unclear.
        </p>
        <p>
          Most CRMs ask you to keep the system updated.
          Chronos does the opposite.
        </p>
        <p><strong>It listens.</strong></p>
      </section>

      {/* SHIFT */}
      <section className="landing-section">
        <h2>From status to events</h2>

        <ul className="landing-compare">
          <li>
            <strong>Status-based systems</strong>
            <span>Fields are overwritten. History is reconstructed.</span>
          </li>
          <li>
            <strong>Chronos</strong>
            <span>Every change is an immutable event.</span>
          </li>
        </ul>

        <p>
          Nothing is guessed. Nothing is rewritten.
          Everything is knowable.
        </p>
      </section>

      {/* CALM */}
      <section className="landing-section">
        <h2>Calm is an outcome</h2>
        <p>
          Chronos feels calm because it doesn’t have to pretend.
          When the system always knows what happened,
          the interface doesn’t need to shout.
        </p>
      </section>

      {/* TASKS */}
      <section className="landing-section">
        <h2>Tasks, reimagined</h2>
        <p>
          Tasks aren’t things you manage.
          They’re consequences.
        </p>
        <p>
          When work is done, it’s done — permanently,
  visibly, and preserved in history.
</p>
</section>
</main>
);
}
