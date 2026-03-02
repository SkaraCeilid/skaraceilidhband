const mentions = [
  {
    quote: '"Kept them up and dancing for hours!"',
    source: "Siobhan Amy Photography",
  },
  {
    quote: '"A really good ceilidh dance band."',
    source: "Cluarantonn (Scottish Digest)",
  },
  {
    quote: '"Live ceilidh music ... to keep you dancing all night."',
    source: "Perth Racecourse (Hogmanay Hoolie)",
  },
];

export default function MentionsSection() {
  return (
    <section id="mentions" className="mentions-section" aria-label="Mentions">
      <div className="mentions-section__inner">
        <p className="mentions-section__eyebrow">Mentions</p>
        <h2 className="mentions-section__title">What people say.</h2>
        <p className="mentions-section__subtitle">
          Public write-ups and event listings mentioning Skara.
        </p>

        <div className="mentions-grid">
          {mentions.map((mention) => (
            <article key={mention.source} className="mentions-card">
              <p className="mentions-card__quote">{mention.quote}</p>
              <p className="mentions-card__source">{mention.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
