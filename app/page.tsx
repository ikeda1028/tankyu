const fields = [
  {
    number: "01",
    label: "FOR BUSINESS",
    title: "組織・事業を変える",
    copy: "新規事業、組織変革、人的資本、AI活用。組織の内側にある問いから、実行可能なプロジェクトを設計します。",
    tags: ["NEW BUSINESS", "ORGANIZATION", "AI"],
  },
  {
    number: "02",
    label: "FOR GOVERNMENT",
    title: "地域・社会を変える",
    copy: "地方創生、官民連携、観光、GX・DX。分野を越えて人と知識をつなぎ、地域の未来を共につくります。",
    tags: ["REGIONAL", "PUBLIC-PRIVATE", "GX / DX"],
  },
  {
    number: "03",
    label: "FOR EDUCATION",
    title: "学びを変える",
    copy: "探究教育、リーダー育成、教育プロジェクト。正解を教えるのではなく、問いから行動する人を育てます。",
    tags: ["LEARNING", "LEADERSHIP", "TANKYU"],
  },
];

const process = [
  ["01", "QUESTION", "本当に変えたいことを問い直す"],
  ["02", "DIALOGUE", "AIと人との対話で視野を広げる"],
  ["03", "PROJECT", "構想を実行可能な計画へ変える"],
  ["04", "IMPACT", "現場で動かし、変化を生み出す"],
];

const members = [
  {
    node: "01",
    name: "炭谷 俊樹",
    roman: "TOSHIKI SUMITANI",
    role: "代表理事",
    fields: ["探究", "教育", "グローバル"],
  },
  {
    node: "02",
    name: "牧山 昭郎",
    roman: "AKIO MAKIYAMA",
    role: "理事",
    fields: ["PPM", "都市開発"],
  },
  {
    node: "03",
    name: "岡田 大士郎",
    roman: "DAISHIRO OKADA",
    role: "理事",
    fields: ["金融", "イノベーション", "グローバル"],
  },
  {
    node: "04",
    name: "池田 哲哉",
    roman: "TETSUYA IKEDA",
    role: "理事",
    fields: ["学び", "PPM", "組織"],
  },
];

function Network() {
  return (
    <div className="network" aria-hidden="true">
      <span className="orbit orbit-a" />
      <span className="orbit orbit-b" />
      <span className="net-line line-a" />
      <span className="net-line line-b" />
      <span className="net-line line-c" />
      <span className="net-node node-a" />
      <span className="net-node node-b" />
      <span className="net-node node-c" />
      <span className="net-node node-d" />
      <span className="network-label label-a">HUMAN</span>
      <span className="network-label label-b">AI</span>
      <span className="network-label label-c">SOCIETY</span>
    </div>
  );
}

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`brand-logo${footer ? " footer-logo" : ""}`} aria-label="TLA">
      <img src="/tla-logo-canonical.png" alt="" />
    </span>
  );
}

function FieldVisual({ number }: { number: string }) {
  if (number === "01") {
    return (
      <div className="field-node visual-business" aria-hidden="true">
        <i className="visual-label">QUESTION</i><i className="visual-label end-label">VENTURE</i>
        <span className="v-path p1" /><span className="v-path p2" /><span className="v-path p3" />
        <b className="v-node origin" /><b className="v-node idea n1" /><b className="v-node idea n2" /><b className="v-node idea n3" /><b className="v-node outcome" />
      </div>
    );
  }
  if (number === "02") {
    return (
      <div className="field-node visual-society" aria-hidden="true">
        <i className="visual-label">CO-CREATION NETWORK</i>
        <span className="v-path mesh m1" /><span className="v-path mesh m2" /><span className="v-path mesh m3" /><span className="v-path mesh m4" /><span className="v-path mesh m5" />
        <b className="v-node s1" /><b className="v-node s2" /><b className="v-node s3" /><b className="v-node s4" /><b className="v-node s5" /><b className="v-node hub" />
      </div>
    );
  }
  return (
    <div className="field-node visual-learning" aria-hidden="true">
      <i className="visual-label">CURIOSITY</i><i className="visual-label end-label">ACTION</i>
      <span className="v-path learning-path lp1" /><span className="v-path learning-path lp2" /><span className="v-path learning-path lp3" />
      <b className="v-node step l1" /><b className="v-node step l2" /><b className="v-node step l3" /><b className="v-node step l4" />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="logo-link" href="#top" aria-label="TLA ホーム"><BrandLogo /></a>
        <nav aria-label="メインナビゲーション">
          <a href="#about">ABOUT</a>
          <a href="#solutions">SOLUTIONS</a>
          <a href="#method">METHOD</a>
          <a href="#people">PEOPLE</a>
        </nav>
        <a className="header-contact" href="#contact">CONTACT ↗</a>
      </header>

      <section className="hero grid-bg" id="top">
        <Network />
        <div className="hero-index mono">001 / FROM QUESTION TO IMPACT</div>
        <div className="hero-copy">
          <p className="eyebrow mono">TANKYU LEADERSHIP ACADEMY</p>
          <h1><span>問いを、</span><br />社会を動かす<br />プロジェクトへ。</h1>
          <p className="hero-lead">
            TLAは、AIと探究の専門家が、企業・自治体・教育機関の課題を
            <strong>構想から社会実装まで伴走する団体</strong>です。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#solutions">できることを見る <span>↓</span></a>
            <a className="button button-ghost" href="#contact">プロジェクトを相談する <span>↗</span></a>
          </div>
        </div>
        <div className="question-mark" aria-hidden="true">Q<span>_</span></div>
        <div className="hero-bottom mono"><span>QUESTION</span><span>→</span><span>DIALOGUE</span><span>→</span><span>PROJECT</span><span>→</span><span>IMPACT</span></div>
      </section>

      <section className="intro" id="about">
        <div className="section-id mono">002 / WHAT IS TLA?</div>
        <div className="intro-content">
          <p className="kicker">HUMAN × AI × SOCIETY</p>
          <h2>答えを提供するのではなく、<br />変化が生まれる仕組みをつくる。</h2>
          <p>TLAは、研修会社でもAIサービスでもありません。人の問い、AIの探索力、多様な専門家、そして現実の社会課題を接続する、探究と実装のエコシステムです。</p>
        </div>
        <div className="definition">
          <span className="mono">OUR ROLE</span>
          <strong>問いを深める</strong>
          <strong>知をつなぐ</strong>
          <strong>プロジェクトを動かす</strong>
        </div>
      </section>

      <section className="solutions grid-bg" id="solutions">
        <div className="section-heading">
          <div className="section-id mono">003 / WHAT WE DO</div>
          <div>
            <p className="kicker">THREE ACTION FIELDS</p>
            <h2>3つの領域で、<br />問いを実装へ。</h2>
          </div>
          <p className="section-summary">課題の整理だけで終わらせず、必要な人材・知識・技術をつなぎ、現場で動くプロジェクトに変えていきます。</p>
        </div>
        <div className="field-grid">
          {fields.map((field) => (
            <article className="field-card" key={field.number}>
              <div className="field-top mono"><span>NODE / {field.number}</span><span>{field.label}</span></div>
              <FieldVisual number={field.number} />
              <h3>{field.title}</h3>
              <p>{field.copy}</p>
              <div className="tags mono">{field.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <a href="#contact" aria-label={`${field.title}について相談する`}>相談する <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="method" id="method">
        <div className="section-id mono">004 / HOW WE WORK</div>
        <div className="method-title">
          <p className="kicker">AI EXPANDS POSSIBILITY.<br />HUMAN CREATES MEANING.</p>
          <h2>問いからインパクトまで、<br />ひとつのチームで。</h2>
        </div>
        <div className="process-list">
          {process.map(([n, title, copy]) => (
            <div className="process-item" key={n}>
              <span className="process-number mono">{n}</span>
              <span className="process-dot" aria-hidden="true" />
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="founder grid-bg" id="people">
        <div className="section-id mono">005 / PEOPLE</div>
        <div className="founder-mark" aria-hidden="true">人<span>_</span></div>
        <blockquote>
          <p>
            <span>「社会を変えるのは、</span>
            <span>制度だけではない。</span>
            <span>問いを持ち、動き出す人です。」</span>
          </p>
          <footer><strong>炭谷 俊樹</strong><span>代表理事 / TOSHIKI SUMITANI</span></footer>
        </blockquote>
        <div className="founder-copy">
          <p>個人の探究心を、組織や地域を動かす力へ。TLAは、AIと人間の知性を組み合わせ、次の時代をつくるリーダーとプロジェクトを育てます。</p>
          <a href="#contact">TLAについて話を聞く ↗</a>
        </div>
        <div className="people-heading">
          <p className="kicker">THE COLLECTIVE</p>
          <h2>TLAを動かす4人</h2>
          <p>領域を越える知と経験を持ち寄り、問いを実行可能なプロジェクトへ変えていきます。</p>
        </div>
        <div className="people-grid">
          {members.map((member) => (
            <article className="person-card" key={member.node}>
              <div className="person-node mono">
                <span>NODE / {member.node}</span>
                <i aria-hidden="true" />
              </div>
              <div className="person-index" aria-hidden="true">{member.node}</div>
              <div className="person-info">
                <p className="person-role mono">{member.role}</p>
                <h3>{member.name}</h3>
                <p className="person-roman mono">{member.roman}</p>
                <div className="person-fields mono">
                  {member.fields.map((field) => <span key={field}>{field}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="section-id mono">006 / START A DIALOGUE</div>
        <p className="kicker">WHAT DO YOU WANT TO CHANGE?</p>
        <h2>変えたいことから、<br />話を始めましょう。</h2>
        <p>構想がまだ曖昧でも構いません。企業、自治体、教育機関の課題や、新しいプロジェクトの可能性についてお聞かせください。</p>
        <a className="contact-link" href="mailto:ikeda@tankyu.academy">ikeda@tankyu.academy <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <BrandLogo footer />
        <p>一般社団法人探究リーダーシップアカデミー</p>
        <div className="footer-meta mono"><span>© 2026 TLA</span><span>QUESTION → IMPACT</span></div>
      </footer>
    </main>
  );
}
