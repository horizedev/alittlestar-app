import { ArrowLeft } from 'lucide-react'
import { BrandMark, BrandName } from './Brand'
import {
  LEGAL_UPDATED_AT,
  legalMeta,
  privacySections,
  termsSections,
  type LegalDoc,
  type LegalSection,
} from './legal'

function formatUpdatedAt(isoDate: string) {
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`))
}

function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="legal-sections">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}

export function LegalPage({
  doc,
  onBack,
  onOpenDoc,
}: {
  doc: LegalDoc
  onBack: () => void
  onOpenDoc: (next: LegalDoc) => void
}) {
  const meta = legalMeta[doc]
  const otherDoc: LegalDoc = doc === 'terms' ? 'privacy' : 'terms'
  const otherMeta = legalMeta[otherDoc]

  return (
    <div className="legal-page">
      <a className="skip-link" href="#legal-main">
        跳到主要內容
      </a>

      <header className="legal-header">
        <div className="legal-header-inner">
          <button className="legal-back" type="button" onClick={onBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            返回
          </button>
          <a className="landing-brand" href="/" onClick={(event) => {
            event.preventDefault()
            onBack()
          }}>
            <BrandMark size={28} />
            <BrandName />
          </a>
          <nav className="legal-doc-switch" aria-label="法律文件">
            <button
              type="button"
              className={doc === 'terms' ? 'active' : ''}
              onClick={() => onOpenDoc('terms')}
            >
              服務條款
            </button>
            <button
              type="button"
              className={doc === 'privacy' ? 'active' : ''}
              onClick={() => onOpenDoc('privacy')}
            >
              私隱政策
            </button>
          </nav>
        </div>
      </header>

      <main id="legal-main" className="legal-main">
        <article className="legal-article">
          <p className="legal-kicker" translate="no">
            Childsteps · childsteps.fit
          </p>
          <h1>
            {meta.title}
            <small>{meta.englishTitle}</small>
          </h1>
          <p className="legal-updated">最近更新日期：{formatUpdatedAt(LEGAL_UPDATED_AT)}</p>
          <p className="legal-intro">{meta.description}</p>

          <LegalSections
            sections={doc === 'terms' ? termsSections : privacySections}
          />

          <aside className="legal-related">
            <p>
              請一併閱讀
              {' '}
              <button type="button" className="text-button" onClick={() => onOpenDoc(otherDoc)}>
                {otherMeta.title}
              </button>
              。
            </p>
          </aside>
        </article>
      </main>

      <footer className="landing-footer legal-footer">
        <div className="landing-brand">
          <BrandMark size={24} />
          <BrandName bilingual />
        </div>
        <span>© {new Date().getFullYear()} 童步 Childsteps</span>
      </footer>
    </div>
  )
}
