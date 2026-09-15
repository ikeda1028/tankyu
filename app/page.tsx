import NetworkScene from "./network-scene";
import JourneyLine from "./journey-line";
import FounderQuotes from "./founder-quotes";

const fields = [
  { number: "01", label: "BUSINESS", title: "組織・事業を変える", question: "なぜ、いいアイデアが\n実行につながらない？", copy: "新規事業、組織変革、人的資本、AI活用。組織の内側にある問いから、実行可能なプロジェクトを設計します。", tags: "新規事業 / 組織変革 / AI活用" },
  { number: "02", label: "SOCIETY", title: "地域・社会を変える", question: "この地域の可能性を、\n誰と育てよう？", copy: "地方創生、官民連携、観光、GX・DX。分野を越えて人と知識をつなぎ、地域の未来を共につくります。", tags: "地方創生 / 官民連携 / GX・DX" },
  { number: "03", label: "LEARNING", title: "学びを変える", question: "学ぶ意欲は、\nどこから生まれる？", copy: "探究教育、リーダー育成、教育プロジェクト。問いを深め、自ら行動する人を育てます。", tags: "探究教育 / リーダー育成 / 学習設計" },
];
const process = [
  { name: "QUESTION", title: "問いを深める", copy: "対話を通じて、本当に変えたいことを見つめ直す。" },
  { name: "DIALOGUE", title: "知をつなぐ", copy: "AIの探索力と専門家の経験で、新しい視点をひらく。" },
  { name: "PROJECT", title: "構想をかたちに", copy: "必要な人・技術・資源を集め、実行できる計画へ。" },
  { name: "IMPACT", title: "現場で動かす", copy: "実践と振り返りを重ね、次の変化につなげる。" },
];
const members = [
  { node: "01", name: "炭谷 俊樹", roman: "TOSHIKI SUMITANI", role: "代表理事", photo: "/member-sumitani.png", field: "探究 / 教育 / グローバル", copy: "探究を起点に、人が育ち、社会が変わる仕組みをつくる。", position: "61% 35%" },
  { node: "02", name: "牧山 昭郎", roman: "AKIO MAKIYAMA", role: "理事", photo: "/member-makiyama.png", field: "都市開発 / 地域連携", copy: "都市開発の知見と国際ネットワークを、地域の未来へ。", position: "50% 32%" },
  { node: "03", name: "岡田 大士郎", roman: "DAISHIRO OKADA", role: "理事", photo: "/member-okada.jpg", field: "金融 / イノベーション", copy: "金融とグローバルビジネスの経験から、新たな事業の可能性をひらく。", position: "52% 30%" },
  { node: "04", name: "池田 哲哉", roman: "TETSUYA IKEDA", role: "理事", photo: "/member-ikeda.jpg", field: "学び / PPM / 組織", copy: "探究型学習の設計と実践を通じて、学びを行動につなげる。", position: "48% 43%" },
];
const dialoguePrompt = "TLA（一般社団法人探究リーダーシップアカデミー）への相談内容を整理したいです。TLAは、AIと探究の専門家が企業・自治体・教育機関の課題を構想から社会実装まで伴走する団体です。あなたは相談の整理を手伝うAIとして、私が変えたいことを明確にするため一度に一つずつ質問してください。最後に、課題・可能性・最初の一歩をまとめてください。TLAへの正式な相談送信や、団体を代表した約束はしないでください。まず『今、気になっていることは何ですか？』と聞いてください。";

function BrandLogo() {
  return <span className="brand-logo"><img src="/tla-logo-canonical.png" alt="TLA" width="368" height="198" /></span>;
}
function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <p className="section-label"><span className="section-node mono">{number}</span><span className="mono">{children}</span></p>;
}
function FieldVisual({ number }: { number: string }) {
  const paths = number === "01" ? ["M24 92 C100 92 85 30 170 30 S250 92 314 92", "M24 92 C105 92 230 92 314 92", "M24 92 C100 92 85 154 170 154 S250 92 314 92"]
    : number === "02" ? ["M33 103 C50 32 110 20 159 44 S267 35 306 78", "M33 103 C100 122 125 54 182 93 S260 142 306 78", "M159 44 C160 77 122 137 91 147 S201 166 263 141", "M91 147 C107 76 239 55 263 141", "M263 141 C216 145 196 118 182 93"]
    : ["M28 144 C85 144 58 114 112 114 S168 67 208 67 S255 27 305 27", "M28 144 C76 156 92 89 112 114 S157 48 208 67 S260 4 305 27"];
  const nodes = number === "01" ? [[24,92],[170,30],[170,92],[170,154],[314,92]] : number === "02" ? [[33,103],[159,44],[182,93],[91,147],[263,141],[306,78]] : [[28,144],[112,114],[208,67],[305,27]];
  return <svg className={"field-visual field-visual-" + number} viewBox="0 0 340 185" fill="none" aria-hidden="true">
    {paths.map((path, i) => <path key={path} d={path} className="field-path" style={{ animationDelay: i * .22 + "s" }} />)}
    {nodes.map(([x,y], i) => <g key={i} className={i === nodes.length - 1 ? "diagram-result" : ""}><circle cx={x} cy={y} r={i === nodes.length - 1 ? 14 : 8} className="diagram-halo" /><circle cx={x} cy={y} r={i === nodes.length - 1 ? 5 : 3.5} className="diagram-node" /></g>)}
  </svg>;
}

export default function Home() {
  return <main id="top">
    <a href="#about" className="skip-link">本文へ移動</a>
    <header className="site-header">
      <a className="logo-link" href="#top" aria-label="TLA ホーム"><BrandLogo /></a>
      <nav aria-label="メインナビゲーション">
        <a href="#about">TLAについて</a><a href="#solutions">できること</a><a href="#people">メンバー</a>
      </nav>
      <a className="header-contact" href="#contact">対話を始める <span aria-hidden="true">↗</span></a>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-index mono">INQUIRY INTO POSSIBILITY.</div>
      <div className="hero-copy">
        <p className="eyebrow mono">TANKYU LEADERSHIP ACADEMY</p>
        <h1 id="hero-title"><span>問いを、</span><br />社会を動かす<br />プロジェクトへ。</h1>
        <p className="hero-lead">企業・自治体・教育機関の課題に、<br className="desktop-break" />AIと探究の専門家が向き合う。<br />TLAは、構想から社会実装まで伴走します。</p>
        <div className="hero-actions"><a className="button button-primary" href="#solutions">できることを見る <span aria-hidden="true">↓</span></a><a className="text-link" href="#contact">AIとの対話から始める <span aria-hidden="true">↗</span></a></div>
      </div>
      <NetworkScene />
      <div className="hero-bottom"><span className="mono">QUESTION <i /> IMPACT</span><span>問いから、まだ見ぬ未来へ。</span><a className="mono" href="#about">SCROLL TO EXPLORE ↓</a></div>
    </section>

    <div className="journey-shell">
      <JourneyLine />
      <section className="intro section-wrap" id="about" aria-labelledby="about-title">
        <SectionLabel number="01">ABOUT TLA</SectionLabel>
        <div className="intro-layout"><h2 id="about-title">人の探究心に、<br />社会を動かす力を。</h2><div className="intro-body"><p>「なぜだろう」「こうなったらいいのに」。<br />変化の始まりは、いつも誰かの問いです。</p><p>私たちは、その問いにAIの探索力と専門家の経験を重ね、人・知識・現場をつなぎます。思いを深めるところから、実際に動くプロジェクトになるまで。それが、探究リーダーシップアカデミーの仕事です。</p><div className="intro-equation"><span>人の問い</span><b>×</b><span>AIの探索力</span><b>×</b><span>実践する人</span></div></div></div>
      </section>

      <section className="solutions section-wrap" id="solutions" aria-labelledby="solutions-title">
        <SectionLabel number="02">FIELDS OF POSSIBILITY</SectionLabel>
        <div className="section-heading"><h2 id="solutions-title">変えたいことは、<br />どこにありますか。</h2><p>組織、地域、学び。<br />3つの領域で、問いを実装へ。</p></div>
        <div className="field-grid">{fields.map((field) => <article className="field-card" key={field.number}>
          <div className="field-top mono"><span>{field.number}</span><span>{field.label}</span></div>
          <h3>{field.title}</h3><p className="field-question">{field.question}</p><FieldVisual number={field.number} />
          <p className="field-tags">{field.tags}</p>
          <details className="field-detail"><summary>支援の内容<span aria-hidden="true">＋</span></summary><p>{field.copy}</p><a className="text-link" href="#contact">このテーマで対話する <span aria-hidden="true">↗</span></a></details>
        </article>)}</div>
      </section>

      <section className="method section-wrap" id="method" aria-labelledby="method-title">
        <SectionLabel number="03">FROM QUESTION TO IMPACT</SectionLabel>
        <div className="section-heading"><h2 id="method-title">問いから実践まで、<br />ひとつのチームで。</h2><p>AIが可能性を広げ、<br />人が意味と覚悟をつくる。</p></div>
        <div className="process-list">{process.map((step,i) => <article className="process-item" key={step.name}><div className="process-track"><span className="process-dot" /><span className="mono">0{i+1} / {step.name}</span></div><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div>
      </section>

      <section className="people section-wrap" id="people" aria-labelledby="people-title">
        <SectionLabel number="04">THE PEOPLE BEHIND TLA</SectionLabel>
        <div className="section-heading"><h2 id="people-title">未来を動かすのは、<br />問いを持つ人。</h2><p>異なる領域の知と経験が、<br />ひとつの問いのもとに集まる。</p></div>
        <div className="founder-feature">
          <figure className="founder-portrait"><img src="/member-sumitani.png" alt="炭谷俊樹 代表理事" width="586" height="408" loading="lazy" /><figcaption className="mono">TOSHIKI SUMITANI / FOUNDING VOICE</figcaption></figure>
          <FounderQuotes />
        </div>
        <div className="people-heading"><h3>TLAを動かす4人</h3><span className="mono">OUR MEMBERS</span></div>
        <div className="people-grid">{members.map((member) => <article className="person-card" key={member.node}>
          <div className="person-photo"><img src={member.photo} alt={member.name} loading="lazy" width="400" height="320" style={{ objectPosition: member.position }} /><span className="portrait-number mono">{member.node}</span></div>
          <div className="person-info"><p className="person-role">{member.role}</p><h3>{member.name}</h3><p className="person-roman mono">{member.roman}</p><p className="person-copy">{member.copy}</p><p className="person-fields">{member.field}</p></div>
        </article>)}</div>
      </section>
    </div>

    <section className="contact section-wrap" id="contact" aria-labelledby="contact-title">
      <div className="contact-heading"><p className="eyebrow mono">EVERYTHING STARTS WITH A QUESTION.</p><h2 id="contact-title">その「なぜ」から、<br />始めましょう。</h2><p>まだ、まとまっていなくても大丈夫。<br />AIとの対話で、気になっていることを<br className="mobile-break" />ひとつの問いへ。</p></div>
      <div className="dialogue-entry"><span className="dialogue-mark" aria-hidden="true">Q<span>_</span></span><p>今、気になっていることは？</p><a className="dialogue-link" href={"https://chatgpt.com/?q=" + encodeURIComponent(dialoguePrompt)} target="_blank" rel="noopener noreferrer">AIとの対話を始める<span aria-hidden="true">↗</span></a><p className="dialogue-note">ChatGPTが新しいタブで開きます。<br />対話の内容はTLAには自動送信されません。</p></div>
    </section>
    <footer className="site-footer"><div><a className="logo-link" href="#top" aria-label="TLA ホーム"><BrandLogo /></a><p>一般社団法人<br />探究リーダーシップアカデミー</p></div><nav aria-label="フッターナビゲーション"><a href="#about">TLAについて</a><a href="#solutions">できること</a><a href="#method">進め方</a><a href="#people">メンバー</a></nav><div className="footer-meta"><span className="mono">© 2026 TLA</span><a href="#top">ページの先頭へ ↑</a></div></footer>
  </main>;
}
