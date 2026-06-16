import { useState, useEffect, useRef } from "react";
import "./portfolio.css";

const STACK_WORDS = [
  "React.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Django REST",
  "PostgreSQL",
];

function useTypedStack() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    const current = STACK_WORDS[wordIndex];
    let timeout;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1100);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 250);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 28);
      } else {
        setWordIndex((i) => (i + 1) % STACK_WORDS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, wordIndex]);

  return text;
}

function useOnScreen(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);
  return [ref, visible];
}

function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return pct;
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useOnScreen();
  return (
    <div
      ref={ref}
      className={`reveal${visible ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ file, children }) {
  const [ref, visible] = useOnScreen();
  return (
    <div ref={ref} className={`section-label${visible ? " visible" : ""}`}>
      <span className="file">{file}</span>
      <span className="rule" />
      <h2>{children}</h2>
    </div>
  );
}

function TermDots() {
  return (
    <span style={{ display: "flex", gap: "5px" }}>
      <i className="term-dot" style={{ background: "#E2574C" }} />
      <i className="term-dot" style={{ background: "#E2A33E" }} />
      <i className="term-dot" style={{ background: "#3CB873" }} />
    </span>
  );
}

function ProjectCard({ filename, year, title, blurb, bullets, stack, links, accent }) {
  const accentColor = accent === "amber" ? "#F0B86E" : "#5EEAD4";
  const accentBg = accent === "amber" ? "rgba(240,184,110,0.06)" : "rgba(94,234,212,0.05)";
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${x}%`);
    cardRef.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`project-card${inView ? " in-view" : ""}`}
      style={{ "--card-accent": accentColor }}
      onMouseMove={handleMove}
    >
      <div className="project-head" style={{ background: accentBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <TermDots />
          <span style={{ fontFamily: "var(--mono)", fontSize: "12.5px", color: "#8A93A6" }}>
            {filename}
          </span>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "#545E70" }}>
          {year}
        </span>
      </div>

      <div className="project-body">
        <h3 className="project-title">{title}</h3>
        <p className="project-blurb">{blurb}</p>

        <ul className="project-bullets">
          {bullets.map((b, i) => (
            <li key={i} style={{ transitionDelay: `${i * 45}ms` }}>
              <span className="arrow" style={{ color: accentColor }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="tag-row">
          {stack.map((s) => (
            <span className="tag" key={s}>{s}</span>
          ))}
        </div>

        <div className="project-links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="project-link"
              style={{ color: accentColor }}
            >
              {l.label} <span className="go">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillRow({ label, items }) {
  return (
    <div className="skill-row">
      <span className="label">{label}</span>
      <span className="items">{items}</span>
    </div>
  );
}

export default function Portfolio() {
  const typed = useTypedStack();
  const [navSolid, setNavSolid] = useState(false);
  const scrollPct = useScrollProgress();

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { id: "work", label: "work" },
    { id: "stack", label: "stack" },
    { id: "about", label: "about" },
    { id: "contact", label: "contact" },
  ];

  return (
    <div className="page">
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="content">
        <nav className={`nav${navSolid ? " solid" : ""}`}>
          <span className="logo">
            anand<span>.dev</span>
          </span>
          <div className="nav-links">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} className="nav-link">
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        <section className="hero" id="top">
          <div>
            <div className="hero-eyebrow">
              ~/anand-donka — immediate joiner, open to relocate
            </div>
            <h1 className="hero-title">
              Full-stack developer
              <br />
              building with{" "}
              <span className="accent">
                {typed}
                <span className="cursor">&nbsp;</span>
              </span>
            </h1>
            <p className="hero-copy">
              2024 EEE graduate who taught himself MERN and Django from scratch, then
              shipped two complete products solo — real-time chat, payments, auth, and
              all. Comfortable across the whole stack, from Postgres schema to pixel.
            </p>
            <div className="hero-actions">
              <a href="#work" className="btn btn-primary">
                view projects
              </a>
              <a href="mailto:ananddonka22@gmail.com" className="btn btn-ghost">
                get in touch
              </a>
            </div>
          </div>

          <div className="term-card">
            <div className="term-head">
              <TermDots />
              <span style={{ marginLeft: "8px", color: "#545E70" }}>profile.json</span>
            </div>
            <div className="term-body">
              <div><span className="k">"role"</span>: <span className="v">"MERN + Python Full-Stack"</span>,</div>
              <div><span className="k">"based"</span>: <span className="v">"Hyderabad, India"</span>,</div>
              <div><span className="k">"shipped"</span>: <span style={{ color: "#5EEAD4" }}>2</span>,</div>
              <div><span className="k">"languages"</span>: [<span className="v">"en", "te", "hi"</span>],</div>
              <div><span className="k">"status"</span>: <span className="status">"open to work"</span></div>
            </div>
          </div>
        </section>

        <section style={{ padding: "4vh 6vw 10vh" }} id="work">
          <SectionLabel file="~/projects">Selected work</SectionLabel>
          <div style={{ display: "grid", gap: "26px" }}>
            <Reveal delay={60}>
              <ProjectCard
                filename="planxdot-backend/"
                year="2026"
                title="SaaS networking & subscription platform"
                blurb="A subscription-based ecosystem connecting entrepreneurs and investors — designed and built solo, end to end, on Django REST Framework and React."
                bullets={[
                  "10+ REST endpoints across user management, subscriptions, and networking workflows",
                  "JWT auth with email and phone OTP, plus role-based access for entrepreneurs, investors, and admins",
                  "Real-time private chat with file sharing and read receipts via Django Channels, WebSockets, and Redis",
                  "Razorpay integration for subscription billing and lifecycle tracking",
                  "NDA acceptance and tracking system to protect shared business ideas",
                  "Admin dashboard with user management and subscription analytics",
                ]}
                stack={["React.js", "Django REST", "PostgreSQL", "Redis", "WebSockets", "Razorpay", "JWT"]}
                links={[{ label: "github", href: "https://github.com/Anand-50/planxdot-backend" }]}
                accent="teal"
              />
            </Reveal>
            <Reveal delay={120}>
              <ProjectCard
                filename="book-it-project/"
                year="2025"
                title="Movie ticket booking application"
                blurb="A responsive MERN app that replaces queue-based booking with browsing, seat selection, and checkout — live in production."
                bullets={[
                  "Reusable React + Vite component architecture, built solo front to back",
                  "Multilingual UI via i18next for broader audience accessibility",
                  "Fully responsive across mobile, tablet, and desktop with Bootstrap and custom CSS3",
                  "Movie listing, detail, seat selection, and multi-step booking flow",
                  "Client-side routing with React Router DOM",
                ]}
                stack={["React.js", "Vite", "Node.js", "Express.js", "MongoDB", "i18next"]}
                links={[
                  { label: "live demo", href: "https://book-it-project.vercel.app/" },
                  { label: "github", href: "https://github.com/Anand-50/Book-it-project" },
                ]}
                accent="amber"
              />
            </Reveal>
          </div>
        </section>

        <section style={{ padding: "4vh 6vw 10vh" }} id="stack">
          <SectionLabel file="~/skills">Technical stack</SectionLabel>
          <Reveal delay={60}>
            <div>
              <SkillRow label="frontend" items="React.js, Vite, JavaScript (ES6+), HTML5, CSS3, Bootstrap, React Router DOM, i18next, Axios" />
              <SkillRow label="mern" items="Node.js, Express.js, MongoDB, Mongoose ODM, REST APIs, JWT" />
              <SkillRow label="python" items="Python, Django, Django REST Framework, Django Channels, WebSockets, Redis" />
              <SkillRow label="database" items="MongoDB, PostgreSQL, SQL, relational & NoSQL schema design" />
              <SkillRow label="auth / pay" items="JWT, email & phone OTP, RBAC, Razorpay, Stripe" />
              <SkillRow label="tooling" items="Git, GitHub, Postman, VS Code, ChatGPT, Claude AI, Cursor" />
            </div>
          </Reveal>
        </section>

        <section style={{ padding: "4vh 6vw 10vh" }} id="about">
          <SectionLabel file="~/about">Background</SectionLabel>
          <Reveal delay={60}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
              <div>
                <p style={{ fontSize: "15px", color: "#C3C9D6", lineHeight: 1.8, margin: "0 0 18px" }}>
                  B.Tech in Electrical and Electronics Engineering, Sankethika Vidya
                  Parishad Engineering College (Andhra University), 2021–2024. Made the
                  jump into full-stack development after graduating, learning by
                  building rather than following tutorials end to end.
                </p>
                <p style={{ fontSize: "15px", color: "#C3C9D6", lineHeight: 1.8, margin: 0 }}>
                  Comfortable owning a project from database schema to deployed UI, and
                  uses AI tooling deliberately to move faster on debugging and
                  unfamiliar territory — not as a substitute for understanding the
                  code.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Strong analytical and problem-solving skills",
                  "Quick learner, adaptable to new technologies",
                  "Clear written and verbal communication",
                  "Works independently or in a team",
                  "Close attention to code quality and UI detail",
                  "Strong drive to grow in software development",
                ].map((s) => (
                  <div key={s} className="check-item">
                    <span className="mark">✓</span>
                    <span className="label">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section style={{ padding: "6vh 6vw 10vh", borderTop: "1px solid #1E2430" }} id="contact">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 600,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    margin: "0 0 14px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Let's build something.
                </h2>
                <p style={{ color: "#8A93A6", fontSize: "15px", margin: 0 }}>
                  Immediate joiner. Available to relocate. Based in Hyderabad, India.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "var(--mono)", fontSize: "13.5px" }}>
                <a href="mailto:ananddonka22@gmail.com" className="contact-link" style={{ color: "#5EEAD4" }}>
                  ananddonka22@gmail.com
                </a>
                <a href="tel:+916301351696" className="contact-link" style={{ color: "#8A93A6" }}>
                  +91 63013 51696
                </a>
                <a href="https://linkedin.com/in/anand-donka-a2400a3b2" target="_blank" rel="noreferrer" className="contact-link" style={{ color: "#8A93A6" }}>
                  linkedin.com/in/anand-donka
                </a>
                <a href="https://github.com/Anand-50" target="_blank" rel="noreferrer" className="contact-link" style={{ color: "#8A93A6" }}>
                  github.com/Anand-50
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <footer style={{ padding: "20px 6vw 30px", borderTop: "1px solid #1E2430" }}>
          <p>built by anand donka — react.js</p>
        </footer>
      </div>
    </div>
  );
}