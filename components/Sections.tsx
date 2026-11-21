"use client";
import { FormEvent, useMemo, useState } from "react";
import { chapters, menu, site, ui } from "@/lib/content";
import { whatsappLink } from "@/lib/whatsapp";
import { useLang } from "./LangProvider";
import { scrollToId } from "./SmoothScroll";

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 1 1-3.7 13.4l-.3-.2-2.4.6.6-2.3-.2-.3A7.2 7.2 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

export function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="header">
      <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0 }); }}>
        <span className="brand__si" lang="si">පහන</span>
        <span className="brand__en">{t(site.descriptor)}</span>
      </a>
      <nav className="nav" aria-label="Main">
        <button onClick={() => scrollToId("menu")}>{t(ui.nav.menu)}</button>
        <button onClick={() => scrollToId("visit")}>{t(ui.nav.visit)}</button>
        <div className="lang" role="group" aria-label="Language">
          <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
          <button aria-pressed={lang === "si"} onClick={() => setLang("si")} lang="si">සිං</button>
        </div>
        <button className="btn btn--small" onClick={() => scrollToId("book")}>{t(ui.nav.book)}</button>
      </nav>
    </header>
  );
}

export function Journey() {
  const { t } = useLang();
  return (
    <section id="journey" aria-label="Our story">
      {chapters.map((c, i) => (
        <div key={c.id} className={`chapter chapter--${c.id} ${i % 2 ? "chapter--right" : ""}`}>
          <div className="chapter__inner">
            <span className="chapter__word" lang="si" aria-hidden="true">{c.word}</span>
            {i === 0 ? (
              <>
                <h1 className="hero__title">{t(c.title)}</h1>
                <p className="hero__body">{t(c.body)}</p>
                <div className="hero__actions">
                  <button className="btn" onClick={() => scrollToId("book")}>{t(ui.bookTable)}</button>
                  <span className="hint">{t(ui.scrollHint)}</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="chapter__title">{t(c.title)}</h2>
                <p className="chapter__body">{t(c.body)}</p>
                {c.id === "table" && (
                  <button className="btn" onClick={() => scrollToId("book")}>{t(ui.bookTable)}</button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

// Thin vertical path on the right: the flame marks where you are in the story.
export function ProgressRail() {
  const { t } = useLang();
  return (
    <ol className="rail" aria-hidden="true">
      {chapters.map((c, i) => (
        <li key={c.id} style={{ top: `${(i / (chapters.length - 1)) * 100}%` }}>
          <span>{t(c.title)}</span>
        </li>
      ))}
      <i className="rail__flame" />
    </ol>
  );
}

const rupees = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

export function Menu() {
  const { t, lang } = useLang();
  const order = whatsappLink(lang === "si" ? "ආයුබෝවන්, මට takeaway ඇණවුමක් කිරීමට අවශ්‍යයි:" : "Hello, I'd like to order takeaway:");
  return (
    <section id="menu" className="panel menu">
      <div className="menu__head">
        <h2>{t(ui.menuTitle)}</h2>
        <p>{t(ui.menuNote)}</p>
      </div>
      <div className="menu__cols">
        {menu.map((sec) => (
          <div key={sec.section.en} className="menu__section">
            <h3>{t(sec.section)}</h3>
            <ul>
              {sec.items.map((it) => (
                <li key={it.name.en}>
                  <div className="dish">
                    <span className="dish__name">
                      {t(it.name)}
                      {it.veg && <span className="veg" title="Vegetarian" aria-label="Vegetarian" />}
                    </span>
                    <span className="dish__lead" aria-hidden="true" />
                    <span className="dish__price">{rupees(it.price)}</span>
                  </div>
                  <p className="dish__desc">{t(it.desc)}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <a className="btn btn--leaf" href={order} target="_blank" rel="noopener noreferrer">
        <ChatIcon /> {t(ui.orderWhatsApp)}
      </a>
    </section>
  );
}

export function Booking() {
  const { t, lang } = useLang();
  const b = ui.booking;
  const today = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);
  const [form, setForm] = useState({ name: "", date: "", time: site.bookingSlots[6], guests: "2", occasion: 0, note: "" });
  const [errors, setErrors] = useState<{ name?: boolean; date?: boolean }>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = { name: !form.name.trim(), date: !form.date || form.date < today };
    setErrors(errs);
    if (errs.name || errs.date) return;
    const occ = Number(form.occasion);
    const lines = [
      `*${t(b.msgHeader)} – ${t(site.name)}*`,
      `${t({ en: "Name", si: "නම" })}: ${form.name.trim()}`,
      `${t(b.date)}: ${form.date}`,
      `${t(b.time)}: ${form.time}`,
      `${t(b.guests)}: ${form.guests}`,
      occ > 0 ? `${t(b.occasion).replace(/\s*\(.*\)/, "")}: ${t(b.occasions[occ])}` : "",
      form.note.trim() ? `${t(b.note).replace(/\s*\(.*\)/, "").replace("?", "")}: ${form.note.trim()}` : "",
    ].filter(Boolean);
    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener");
    setSent(true);
  }

  return (
    <section id="book" className="booking">
      <form className="booking__card" onSubmit={submit} noValidate lang={lang}>
        <h2>{t(b.title)}</h2>
        <p className="booking__intro">{t(b.intro)}</p>

        <label className="field">
          <span>{t(b.name)}</span>
          <input value={form.name} onChange={set("name")} autoComplete="name" aria-invalid={errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
          {errors.name && <em id="err-name" className="err">{t(b.errName)}</em>}
        </label>

        <div className="row">
          <label className="field">
            <span>{t(b.date)}</span>
            <input type="date" min={today} value={form.date} onChange={set("date")} aria-invalid={errors.date} aria-describedby={errors.date ? "err-date" : undefined} />
            {errors.date && <em id="err-date" className="err">{t(b.errDate)}</em>}
          </label>
          <label className="field">
            <span>{t(b.time)}</span>
            <select value={form.time} onChange={set("time")}>
              {site.bookingSlots.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field field--narrow">
            <span>{t(b.guests)}</span>
            <select value={form.guests} onChange={set("guests")}>
              {Array.from({ length: site.maxGuests }, (_, i) => <option key={i}>{i + 1}</option>)}
            </select>
          </label>
        </div>

        <label className="field">
          <span>{t(b.occasion)}</span>
          <select value={form.occasion} onChange={set("occasion")}>
            {b.occasions.map((o, i) => <option key={o.en} value={i}>{t(o)}</option>)}
          </select>
        </label>

        <label className="field">
          <span>{t(b.note)}</span>
          <textarea rows={2} value={form.note} onChange={set("note")} />
        </label>

        <button type="submit" className="btn btn--leaf btn--wide">
          <ChatIcon /> {t(b.send)}
        </button>
        {sent && <p className="sent" role="status">{t(b.sent)}</p>}
      </form>
    </section>
  );
}

export function Visit() {
  const { t } = useLang();
  const v = ui.visit;
  return (
    <section id="visit" className="panel visit">
      <h2>{t(v.title)}</h2>
      <div className="visit__grid">
        <div>
          <h3>{t(v.address)}</h3>
          <p>{t(site.address)}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`} target="_blank" rel="noopener noreferrer">
            {t(v.directions)}
          </a>
        </div>
        <div>
          <h3>{t(v.hours)}</h3>
          <dl>
            {site.hours.map((h) => (
              <div key={h.days.en}>
                <dt>{t(h.days)}</dt>
                <dd>{typeof h.time === "string" ? h.time : t(h.time)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3>{t(v.contact)}</h3>
          <p><a href={`tel:+${site.whatsappNumber}`}>{site.phoneDisplay}</a></p>
          <p><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
          <p className="social">
            {site.social.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}
          </p>
        </div>
      </div>
      <p className="colophon">© {new Date().getFullYear()} {t(site.name)}, {t(site.descriptor)}</p>
    </section>
  );
}

export function FloatingChat() {
  const { t } = useLang();
  return (
    <a className="float-chat" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label={t(ui.chat)}>
      <ChatIcon />
      <span>{t(ui.chat)}</span>
    </a>
  );
}
