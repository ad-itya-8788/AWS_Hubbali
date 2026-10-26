import { useEffect, useState } from "react";
import "./App.css";

const disclosureFiles = [
  ["Public Disclosure", "AWS-HB-MergedPublicDisclosure.pdf"],
  ["Academic Calendar 2025-26", "AWS-HB-AcademicCalendar2025-26.pdf"],
  ["Fee Structure", "AWS-HB-FeeStructure.pdf"],
  ["Building Safety", "AWS-HB-MergedBuildingSafety.pdf"],
  ["Fire Safety", "AWS-HB-New-FireSafety.pdf"],
  ["PTA", "AWS-HB-PTA-G.pdf"],
  ["Certificate of Land", "CertificateofLand300Dpi.pdf"],
  ["List of Staff", "ListofStaff-25.pdf"],
  ["NOC", "NOC-300dpi.pdf"],
  ["RR", "newRR.pdf"],
  ["Trust deed", "Trustdeed300dpi.pdf"],
  ["Water Testing Report", "WaterTestingReport.pdf"],
  ["Land Certificate", "AWSHBMergedLandCertificate.pdf"],
  ["Health & Sanitation", "MergedHealthSanitation.pdf"],
  ["PARENTS TECAHERS ASSOCIATION", "PARENTS-TECAHERS-ASSOCIATION-1.pdf"],
  ["SCHOOL MANAGING COMMITTEE", "SCHOOL-MANAGING-COMMITTEE-1.pdf"],
  ["Self Certification", "self-certification.pdf"],
  ["Mandatory Disclosure", "mandatoryDisclosure.pdf"],
];

const navLinks = [
  ["home", "Home"],
  ["aboutus", "About Us"],
  ["ourFeatures", "Our Features"],
  ["meetOurTeam", "Gallery"],
  ["contact", "Contact us"],
];

const aboutTabs = [
  {
    id: "vision",
    label: "OUR VISION",
    title: "Our Vision",
    image: "mission.jpg",
    text: "Our vision is to shape the individual for a better tomorrow and to make not just learned individuals but a better human being.",
  },
  {
    id: "aim",
    label: "OUR AIM",
    title: "Our Aim",
    image: "vision.jpg",
    text: "Aaryans World School aims to create a supportive and inclusive environment where students are encouraged to explore their personal best in all aspects of school life.",
  },
  {
    id: "goal",
    label: "OUR GOAL",
    title: "Our Goal",
    image: "goal.jpg",
    text: "We are passionate about creating a learning institution that is dynamic and constantly seeking to meet the needs of the present as well as the future, while learning from ethical and moral value systems. It is our commitment to mould children to be open to thinking globally and be prepared for life anywhere in the world.",
  },
];

const features = [
  "Teacher - Student Ratio 1:20",
  "Ample of play equipments",
  "Emotional Quotient Therapy",
  "Parent Assessment",
  "Plenty of Teaching aids",
  "Facial Recognition device",
  "Instant SMS System",
  "Methodology Workshop",
];

const galleryImages = ["gallery-archery.jpg", "gallery-cricket.jpg", "Schoolphoto1.jpg"];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vision");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [showTop, setShowTop] = useState(false);

  const activeAbout = aboutTabs.find((tab) => tab.id === activeTab) || aboutTabs[0];

  // Highlight the current section in the nav (like the live site) + show back-to-top button
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 150;
      let current = "home";
      navLinks.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      });
      setActiveSection(current);
      setShowTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setDisclosureOpen(false);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="nav-wrap">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="Aaryans World School home">
            <img src="/images/aaryansworldschoolhubbali.jpeg" alt="Aaryans World School logo" />
          </a>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            {navLinks.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? "active" : ""}
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
            <div className="disclosure-menu">
              <button
                type="button"
                className="disclosure-trigger"
                aria-expanded={disclosureOpen}
                onClick={() => setDisclosureOpen((open) => !open)}
              >
                Mandatory Disclosure
              </button>
              <div className={`disclosure-list ${disclosureOpen ? "is-open" : ""}`}>
                {disclosureFiles.map(([label, file]) => (
                  <a
                    key={file}
                    href={`/pdf/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section-pad" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Learn • Grow • Shine</span>
              <h1 className="hero-title">
                <span className="hero-title-main">Aaryans World School</span>
                <span className="hero-title-location">Hubbali</span>
              </h1>
              <p>Inspiring young minds through learning, creativity and values.</p>
              <a className="primary-button" href="#contact">Contact Us <span aria-hidden="true">›</span></a>
            </div>
            <div className="hero-art">
              <div className="hero-orbit" />
              <img src="/images/schoolphoto.jpg" alt="Aaryans World School campus" />
            </div>
          </div>
        </section>

        <section className="section-pad about-section" id="aboutus">
          <div className="container">
            <div className="section-heading">
              <h2>About Us</h2>
            </div>

            <div className="about-layout">
              <div className="about-tabs" role="tablist" aria-label="About school">
                {aboutTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={activeTab === tab.id ? "about-tab active" : "about-tab"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <article className="about-panel" role="tabpanel">
                <img src={`/images/${activeAbout.image}`} alt={activeAbout.title} />
                <h3>{activeAbout.title}</h3>
                <p>{activeAbout.text}</p>
                <span className="about-more" aria-hidden="true">›</span>
              </article>
            </div>
          </div>
        </section>

        <section className="section-pad leadership-section">
          <div className="container leadership-grid">
            <div className="leader-image">
              <img src="/images/director.jpg" alt="School director" />
            </div>
            <div className="leader-copy">
              <span className="eyebrow">Director Desk</span>
              <h2>“Excellence is a continuous process and not an accident.” – Dr. A. P. J. Abdul Kalam</h2>
              <p>I feel privileged to be the Director of such an excellent and vibrant school, which offers great openings for its students. It is our goal to make each and every student succeed.</p>
              <p>Aaryans World School was established with a passion of providing high quality education with an equal weight age provided for co- curricular activities. The well-crafted curriculum helps the children not only to compete with the global standards but also creates in them a sense of social responsible towards the Society and Nation.</p>
              <p>The Aaryans World School views education as the development of the whole child – attention or emphasis is placed not just on the intellectual development but also on the pupil’s physical, social and spiritual development. We offer our students the best possible opportunities to become confident, thoughtful young people who are prepared for any future responsibilities.</p>
              <p>I firmly believe that every student is a unique person with his/her own set of skills, wants and aspirations. Education is natural harmonious and progressive development of innate powers.</p>
            </div>
          </div>
        </section>

        <section className="section-pad leadership-section leadership-reverse">
          <div className="container leadership-grid">
            <div className="leader-image">
              <img src="/images/principal.jpg" alt="School principal" />
            </div>
            <div className="leader-copy">
              <span className="eyebrow">Director Panel</span>
              <h2>“Education is the kindling of a flame, not the filling of a vessel.”</h2>
              <p>Keeping the above quote in mind, Aaryans World School was started with a perfect amalgamation of competent teachers, child centric infrastructure and an experienced and efficient administration. The school come into existence with a vision in creating a safe and supportive environment for its students – to provide a perfect balance of academics, sports, artistic and social opportunities. Childhood and learning should be a joy and we strive for that.</p>
              <p>The schools genuine concern ensures student’s emotional growth along with intellectual excellence. This empowers them to develop their self-esteem, self-awareness and self confidence. Sharing ideas, analyzing situation and expressing them confidently are essential skills honed here through experiential learning.</p>
              <p>“Educating the mind without educating the heart is no education at all “ARISTOTLE</p>
              <p>We believe in giving our students strong values along with a set of wings which will help them to be groomed to become confident, articulate and enlightened young citizen, ready to step in the global society with dignity, honor and integrity.</p>
              <p>Besides vigorous scholastic programmers, we seek to develop and nurture the different facts of a child from academic to dance, theatre, music and a variety of sports .Sports is an integral part of our curriculum and is given equal weightage along with academics. We develop the mental and physical abilities of a student.</p>
              <p>Time and again we persistently upgrade and update our teaching tools and techniques. From interactive teaching methods to a healthy teacher – student relationship, we work round making studies as effortless as possible.</p>
              <p>The school takes a special efforts in imbibing in its students the urge to be a sensitive citizen of India and for this it takes initiatives in different social causes, thus developing the skills like compassion, truth, honesty and sensitivity.</p>
            </div>
          </div>
        </section>

        <section className="section-pad features-section" id="ourFeatures">
          <div className="container">
            <div className="section-heading">
              <h2>Our Features</h2>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature}>
                  <svg className="feature-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
<line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <div className="feature-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
<line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <h3>{feature}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad gallery-section" id="meetOurTeam">
          <div className="container">
            <div className="section-heading">
              <h2>Gallery</h2>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <div
                  className="gallery-item"
                  key={image}
                  aria-label={`Gallery image ${index + 1}`}
                >
                  <img src={`/images/${image}`} alt={`School gallery ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad contact-section" id="contact">
          <div className="container">
            <div className="section-heading">
              <h2>Contact Us</h2>
            </div>
            <div className="contact-grid">
              <div className="contact-photo">
                <img src="/images/contactus_1.jpg" alt="Students participating in a school activity" />
              </div>
              <div className="contact-card">
                <h3>Aaryans World School</h3>
                <p>Address: #117/3, Sulla RoadPost: Gopankoppa, Hubballi-580023, Karnataka</p>
                <p className="contact-mob">Mob. 7204274488</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            © {new Date().getFullYear()}. Design with{" "}
            <a
              href="https://www.aayojanai.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", fontWeight: "600" }}
            >
              Aayojan AI
            </a>
            <span className="footer-heart">♥</span> by aaryansworldschool.
          </p>
        </div>
      </footer>

      <a
        href="#home"
        className={`scroll-top ${showTop ? "visible" : ""}`}
        aria-label="Scroll to top"
      >
        ↑
      </a>

      {lightboxImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={() => setLightboxImage(null)}>
          <button type="button" className="lightbox-close" aria-label="Close image" onClick={() => setLightboxImage(null)}>×</button>
          <img
            src={`/images/${lightboxImage}`}
            alt="School gallery enlarged"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default App;
