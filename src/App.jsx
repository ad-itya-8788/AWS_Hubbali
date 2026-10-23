import { useState } from "react";
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

const galleryImages = ["gallery-archery.jpg", "gallery-cricket.jpg", "schoolphoto.jpg"];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vision");
  const [lightboxImage, setLightboxImage] = useState(null);

  const activeAbout = aboutTabs.find((tab) => tab.id === activeTab) || aboutTabs[0];

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
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#aboutus" onClick={closeMenu}>About Us</a>
            <a href="#ourFeatures" onClick={closeMenu}>Our Features</a>
            <a href="#meetOurTeam" onClick={closeMenu}>Gallery</a>
            <a href="#contact" onClick={closeMenu}>Contact us</a>
            <div className="disclosure-menu">
              <button
                type="button"
                className="disclosure-trigger"
                aria-expanded={disclosureOpen}
                onClick={() => setDisclosureOpen((open) => !open)}
              >
                Mandatory Disclosure <span aria-hidden="true">⌄</span>
              </button>
              <div className={`disclosure-list ${disclosureOpen ? "is-open" : ""}`}>
                {disclosureFiles.map(([label, file]) => (
                  <a
                    key={file}
                    href={`/pdfs/${file}`}
                    target="_blank"
                    rel="noreferrer"
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
              <h1>Aaryans World School <span>Hubballi</span></h1>
              <p>Inspiring young minds through learning, creativity and values.</p>
              <a className="primary-button" href="#contact">Contact Us <span aria-hidden="true">→</span></a>
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
              <span className="eyebrow">Who we are</span>
              <h2>About Us</h2>
              <p>Building a strong foundation for every child's tomorrow.</p>
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
                    <span>{tab.label}</span>
                    <small>{tab.title}</small>
                  </button>
                ))}
              </div>
              <article className="about-panel" role="tabpanel">
                <img src={`/images/${activeAbout.image}`} alt={activeAbout.title} />
                <div>
                  <span className="eyebrow">Our purpose</span>
                  <h3>{activeAbout.title}</h3>
                  <p>{activeAbout.text}</p>
                </div>
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
              <h2>“Excellence is a continuous process and not an accident.”</h2>
              <p className="quote-credit">— Dr. A. P. J. Abdul Kalam</p>
              <p>I feel privileged to be the Director of such an excellent and vibrant school, which offers great openings for its students. It is our goal to make each and every student succeed.</p>
              <p>Aaryans World School was established with a passion for providing high-quality education with equal importance given to co-curricular activities. Our curriculum helps children meet global standards and develop a sense of social responsibility towards society and the nation.</p>
              <p>We view education as the development of the whole child. Along with intellectual growth, we focus on physical, social and spiritual development so students can become confident, thoughtful young people prepared for future responsibilities.</p>
              <p>Every student is unique, with their own skills, interests and aspirations. We believe education should support the natural, harmonious and progressive development of each child's abilities.</p>
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
              <p>Keeping this quote in mind, Aaryans World School brings together competent teachers, child-centric infrastructure and experienced administration. We aim to create a safe and supportive environment with a balance of academics, sports, artistic and social opportunities.</p>
              <p>Our school supports students' emotional growth along with intellectual excellence, helping them develop self-esteem, self-awareness and confidence. Sharing ideas, analysing situations and expressing themselves confidently are essential skills developed through experiential learning.</p>
              <p>“Educating the mind without educating the heart is no education at all.” — Aristotle</p>
              <p>We believe in giving students strong values and the confidence to become articulate, enlightened citizens ready to contribute to the global society with dignity, honour and integrity.</p>
              <p>Alongside academics, we nurture dance, theatre, music and sports. We regularly improve our teaching methods and encourage a healthy teacher-student relationship, while promoting compassion, truth, honesty and sensitivity.</p>
            </div>
          </div>
        </section>

        <section className="section-pad features-section" id="ourFeatures">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Why choose us</span>
              <h2>Our Features</h2>
              <p>A supportive environment for learning and development.</p>
            </div>
            <div className="feature-grid">
              {features.map((feature, index) => (
                <article className="feature-card" key={feature}>
                  <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="feature-icon" aria-hidden="true">{["✦", "◎", "♡", "◇"][index % 4]}</div>
                  <h3>{feature}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad gallery-section" id="meetOurTeam">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Life at school</span>
              <h2>Gallery</h2>
              <p>Moments and memories from our school community.</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <button
                  className="gallery-item"
                  key={image}
                  type="button"
                  onClick={() => setLightboxImage(image)}
                  aria-label={`View gallery image ${index + 1}`}
                >
                  <img src={`/images/${image}`} alt={`School gallery ${index + 1}`} />
                  <span className="gallery-overlay">View image ↗</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad contact-section" id="contact">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Get in touch</span>
              <h2>Contact Us</h2>
              <p>We would be happy to hear from you.</p>
            </div>
            <div className="contact-grid">
              <div className="contact-photo">
                <img src="/images/contactus_1.jpg" alt="Students participating in a school activity" />
              </div>
              <div className="contact-card">
                <span className="contact-symbol" aria-hidden="true">⌖</span>
                <h3>Aaryans World School</h3>
                <p className="contact-label">Address</p>
                <p>#117/3, Sulla Road, Post: Gopankoppa, Hubballi-580023, Karnataka</p>
                <div className="contact-divider" />
                <p className="contact-label">Phone</p>
                <a className="phone-link" href="tel:7204274488">7204274488</a>
                <a className="primary-button contact-button" href="tel:7204274488">Call the school <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

    <footer className="site-footer">
        <div className="container footer-inner">

          <p>© {new Date().getFullYear()} Design with Nikhil Kholam ❤️ by aaryansworldschool.</p>
          <a className="footer-top" href="#home" aria-label="Back to top">↑</a>
        </div>
      </footer>

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
