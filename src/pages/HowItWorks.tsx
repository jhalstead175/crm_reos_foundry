import "./styles/how-it-works.css";

export default function HowItWorks() {
  return (
    <main className="how">
      {/* INTRO */}
      <section className="how-hero">
        <h1>How Chronos works</h1>
        <p className="how-subhead">
          Chronos doesn’t manage work the way traditional CRMs do.
          It records reality — one event at a time.
        </p>
      </section>

      {/* STEP 1 */}
      <section className="how-section">
        <h2>1. Everything is an event</h2>
        <p>
          In Chronos, nothing is silently overwritten.
          Every meaningful change is recorded as an event:
        </p>
        <ul>
          <li>A task is created</li>
          <li>Responsibility changes</li>
          <li>Work is completed</li>
          <li>A deadline is set</li>
        </ul>
        <p>
          Events are immutable.
          Once they happen, they are never edited or erased.
        </p>
      </section>

      {/* STEP 2 */}
      <section className="how-section">
        <h2>2. The timeline is the source of truth</h2>
        <p>
          Chronos does not reconstruct history from fields and statuses.
          The timeline <em>is</em> the history.
        </p>
        <p>
          Every action appears in order, with context and authorship.
          You don’t guess what changed.
          You see what happened.
        </p>
      </section>

      {/* STEP 3 */}
      <section className="how-section">
        <h2>3. Tasks are derived, not managed</h2>
        <p>
          Tasks in Chronos are not standalone objects.
          They are consequences of events.
        </p>
        <p>
          When something happens that creates work,
          a task appears automatically.
          When the work is done, the task is marked complete
          and preserved in history.
        </p>
        <p>
          You don't manage tasks. You do them.
        </p>
      </section>

      {/* STEP 4 */}
      <section className="how-section">
        <h2>4. Clarity compounds over time</h2>
        <p>
          Because nothing is overwritten,
          Chronos becomes more useful the longer it runs.
        </p>
        <p>
          Patterns emerge. Context accumulates.
          The system gets smarter without needing to be told.
        </p>
        <p>
          This is the opposite of CRM entropy.
        </p>
      </section>
    </main>
  );
}
