import "./styles/faq.css";

export default function FAQ() {
  return (
    <main className="faq">
      {/* HERO */}
      <section className="faq-hero">
        <h1>Frequently asked questions</h1>
        <p className="faq-subhead">
          Chronos works differently than most real estate software.
          These answers address the questions that usually come up first.
        </p>
      </section>

      {/* QUESTIONS */}
      <section className="faq-list">
        <details>
          <summary>Is Chronos a CRM?</summary>
          <p>
            Chronos replaces the operational core of a traditional CRM,
            but it is not built around leads, pipelines, or status fields.
          </p>
          <p>
            Chronos is a transaction-first operating system that records
            what actually happens — so the rest of the system stays aligned.
          </p>
        </details>

        <details>
          <summary>Where are the pipelines and stages?</summary>
          <p>
            Chronos does not rely on pipeline stages to explain reality.
            Stages tend to drift, get skipped, or mean different things
            to different people.
          </p>
          <p>
            In Chronos, the timeline shows exactly what has happened,
            in order. If a deal is moving forward, the events make that
            obvious without interpretation.
          </p>
        </details>

        <details>
          <summary>Does Chronos use AI or automation?</summary>
          <p>
            Chronos is intentionally conservative about automation.
            It records reality first, before attempting to optimize it.
          </p>
          <p>
            This ensures that any future automation or intelligence
            operates on trustworthy data — not guessed or overwritten state.
          </p>
        </details>

        <details>
          <summary>Can tasks be edited or deleted?</summary>
          <p>
            Tasks in Chronos are consequences of events.
            They are not manually groomed or rewritten.
          </p>
          <p>
            When work is completed, it is marked complete and preserved
            in history. This prevents confusion and retroactive changes.
          </p>
        </details>

        <details>
          <summary>What happens if someone makes a mistake?</summary>
          <p>
            Mistakes are handled by recording what happened next,
            not by erasing the past.
          </p>
          <p>
            This creates a defensible, understandable record and avoids
            silent corrections that lead to confusion later.
          </p>
        </details>

        <details>
          <summary>Is Chronos suitable for teams?</summary>
          <p>
            Yes. Chronos is built for teams that need shared clarity.
            Everyone sees the same timeline, the same tasks, the same history.
          </p>
          <p>
            This reduces the need for status meetings and email chains.
            The system itself becomes the source of truth.
          </p>
        </details>
      </section>
    </main>
  );
}
