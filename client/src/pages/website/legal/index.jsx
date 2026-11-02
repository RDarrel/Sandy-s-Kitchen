import { useEffect } from "react";
import { legalDocuments } from "./documents";
import "./style.css";

const LegalPage = ({ documentKey }) => {
  const document = legalDocuments[documentKey];

  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${document.title} | Sandy's Kitchenette`;
    return () => {
      window.document.title = previousTitle;
    };
  }, [document.title]);

  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <header className="legal-page__header">
          <h1>{document.title}</h1>
          <p className="legal-page__updated">
            Last updated: <time dateTime="2026-11-02">November 2, 2026</time>
          </p>
        </header>

        <article className="legal-page__document" aria-label={document.title}>
          <p>{document.introduction}</p>
          <p>{document.note}</p>
          {document.sections.map(({ id, title, paragraphs, resource }, index) => (
            <section
              className="legal-page__section"
              id={id}
              key={id}
              aria-labelledby={`${id}-title`}
            >
              <h2 id={`${id}-title`}>
                {index + 1}. {title}
              </h2>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {resource && (
                <a href={resource.href} target="_blank" rel="noopener noreferrer">
                  {resource.label}
                </a>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default LegalPage;
