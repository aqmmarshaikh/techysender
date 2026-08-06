import { useEffect } from 'react';
import { SEO } from '../components/seo/SEO';
import { getBreadcrumbSchema } from '../components/seo/StructuredData';
import './DeveloperPage.css';

export function DeveloperPage() {
  useEffect(() => {
    let isMounted = true;
    let animFrameId: number;
    let particleFrameId: number;
    let rotatorInterval: NodeJS.Timeout;
    let loaderInterval: NodeJS.Timeout;

    // 1. Loader Animation
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    const pct = document.getElementById('loaderPercent');
    const msg = document.getElementById('loaderMsg');
    const loaderMessages = [
      'INITIALIZING SYSTEM',
      'LOADING NEURAL CORE',
      'CALIBRATING UI MATRIX',
      'BOOTING FOUNDER OS',
      'READY'
    ];
    let p = 0;
    if (loader && fill && pct && msg) {
      loaderInterval = setInterval(() => {
        p += Math.random() * 8 + 3;
        if (p >= 100) {
          p = 100;
          clearInterval(loaderInterval);
          setTimeout(() => {
            if (loader) loader.classList.add('hidden');
          }, 350);
        }
        fill.style.width = p + '%';
        pct.textContent = String(Math.floor(p)).padStart(2, '0');
        msg.textContent = loaderMessages[Math.min(loaderMessages.length - 1, Math.floor(p / 25))];
      }, 120);
    }

    // 2. Year Footer Update
    const yearElem = document.getElementById('year');
    if (yearElem) {
      yearElem.textContent = String(new Date().getFullYear());
    }

    // 3. Custom Cursor
    const cDot = document.getElementById('cursorDot');
    const cRing = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animateCursor = () => {
      if (!isMounted) return;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (cDot) cDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      if (cRing) cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      animFrameId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverElements = document.querySelectorAll(
      '.developerPageContainer a, .developerPageContainer button, .developerPageContainer .skill-card, .developerPageContainer .soc, .developerPageContainer .stat-card, .developerPageContainer .t-card, .developerPageContainer input, .developerPageContainer textarea'
    );
    const addHover = () => cRing && cRing.classList.add('hover');
    const removeHover = () => cRing && cRing.classList.remove('hover');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    // 4. Mouse Glow
    const mGlow = document.getElementById('mouseGlow');
    const handleMouseGlow = (e: MouseEvent) => {
      if (!mGlow) return;
      mGlow.style.left = e.clientX + 'px';
      mGlow.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', handleMouseGlow);

    // 5. Scroll Nav & Active Links
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.developerPageContainer .nav-links a');
    const handleScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
      let cur = '';
      document.querySelectorAll('.developerPageContainer section[id]').forEach(s => {
        const top = (s as HTMLElement).offsetTop - 120;
        if (window.scrollY >= top) cur = s.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    };
    window.addEventListener('scroll', handleScroll);

    // 6. Hero Title Rotator
    const rotItems = document.querySelectorAll('.rot-item');
    let ri = 0;
    if (rotItems.length > 0) {
      rotatorInterval = setInterval(() => {
        if (!rotItems[ri]) return;
        rotItems[ri].classList.remove('active');
        rotItems[ri].classList.add('exit');
        ri = (ri + 1) % rotItems.length;
        if (rotItems[ri]) {
          rotItems[ri].classList.remove('exit');
          rotItems[ri].classList.add('active');
        }
        setTimeout(() => {
          rotItems.forEach((it, i) => {
            if (i !== ri) it.classList.remove('exit');
          });
        }, 700);
      }, 2400);
    }

    // 7. Magnetic Buttons
    const magneticElems = document.querySelectorAll('.magnetic');
    magneticElems.forEach(el => {
      const htmlEl = el as HTMLElement;
      const onMove = (e: Event) => {
        const me = e as MouseEvent;
        const r = htmlEl.getBoundingClientRect();
        const x = me.clientX - r.left - r.width / 2;
        const y = me.clientY - r.top - r.height / 2;
        htmlEl.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
        const glow = htmlEl.querySelector('.btn-glow') as HTMLElement | null;
        if (glow) {
          glow.style.setProperty('--mx', ((me.clientX - r.left) / r.width * 100) + '%');
        }
      };
      const onLeave = () => {
        htmlEl.style.transform = '';
      };
      htmlEl.addEventListener('mousemove', onMove);
      htmlEl.addEventListener('mouseleave', onLeave);
    });

    // 8. Skill Card 3D Tilt
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
      const htmlCard = card as HTMLElement;
      const onMove = (e: Event) => {
        const me = e as MouseEvent;
        const r = htmlCard.getBoundingClientRect();
        htmlCard.style.setProperty('--mx', (me.clientX - r.left) + 'px');
        htmlCard.style.setProperty('--my', (me.clientY - r.top) + 'px');
        const rx = ((me.clientY - r.top) / r.height - 0.5) * -8;
        const ry = ((me.clientX - r.left) / r.width - 0.5) * 8;
        htmlCard.style.transform = `translateY(-6px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => {
        htmlCard.style.transform = '';
      };
      htmlCard.addEventListener('mousemove', onMove);
      htmlCard.addEventListener('mouseleave', onLeave);
    });

    // 9. Holo Frame 3D Tilt
    const holo = document.getElementById('holoFrame');
    if (holo) {
      const onMove = (e: MouseEvent) => {
        const r = holo.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -14;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
        holo.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => {
        holo.style.transform = '';
      };
      holo.addEventListener('mousemove', onMove);
      holo.addEventListener('mouseleave', onLeave);
    }

    // 10. Intersection Observer (Count Up & Reveal)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          en.target.classList.add('in-view');
          const num = en.target.querySelector('.stat-num') as HTMLElement | null;
          if (num && !num.dataset.done) {
            num.dataset.done = '1';
            const target = parseInt(num.dataset.count || '0', 10);
            const dur = 1400;
            const start = performance.now();
            const step = (t: number) => {
              const k = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - k, 3);
              num.textContent = String(Math.floor(eased * target));
              if (k < 1) requestAnimationFrame(step);
              else num.textContent = target + (target >= 10 ? '+' : '');
            };
            requestAnimationFrame(step);
          }
          observer.unobserve(en.target);
        });
      },
      { threshold: 0.25 }
    );
    document
      .querySelectorAll('.developerPageContainer .stat-card, .developerPageContainer .skill-card, .developerPageContainer .t-card, .developerPageContainer .panel')
      .forEach(el => observer.observe(el));

    // 11. Particles Canvas
    const canvas = document.getElementById('particles') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);
        let particlesArr: Array<{ x: number; y: number; vx: number; vy: number; r: number; c: string }> = [];

        const resizeCanvas = () => {
          if (!canvas) return;
          W = canvas.width = window.innerWidth;
          H = canvas.height = window.innerHeight;
        };

        const initParticles = () => {
          const count = window.innerWidth < 768 ? 50 : 110;
          particlesArr = [];
          for (let i = 0; i < count; i++) {
            particlesArr.push({
              x: Math.random() * W,
              y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              r: Math.random() * 1.6 + 0.4,
              c: Math.random() > 0.5 ? '0,240,255' : '168,85,247',
            });
          }
        };

        resizeCanvas();
        initParticles();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('resize', initParticles);

        let pmx = -9999, pmy = -9999;
        const handleParticleMouse = (e: MouseEvent) => {
          pmx = e.clientX;
          pmy = e.clientY;
        };
        window.addEventListener('mousemove', handleParticleMouse);

        const drawParticles = () => {
          if (!isMounted) return;
          ctx.clearRect(0, 0, W, H);
          for (let i = 0; i < particlesArr.length; i++) {
            const p = particlesArr[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            const dx = p.x - pmx;
            const dy = p.y - pmy;
            const d2 = dx * dx + dy * dy;
            if (d2 < 14400) {
              const f = (14400 - d2) / 14400;
              p.x += (dx / Math.sqrt(d2)) * f * 1.5;
              p.y += (dy / Math.sqrt(d2)) * f * 1.5;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.c},0.7)`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${p.c},0.9)`;
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          for (let i = 0; i < particlesArr.length; i++) {
            for (let j = i + 1; j < particlesArr.length; j++) {
              const a = particlesArr[i];
              const b = particlesArr[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < 14000) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(0,240,255,${0.12 * (1 - d2 / 14000)})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }
          particleFrameId = requestAnimationFrame(drawParticles);
        };
        drawParticles();
      }
    }

    // 12. Parallax Orbs
    const orbs = document.querySelectorAll('.developerPageContainer .orb');
    const handleOrbMouse = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      orbs.forEach((o, i) => {
        const f = (i + 1) * 12;
        (o as HTMLElement).style.transform = `translate(${x * f}px, ${y * f}px)`;
      });
    };
    window.addEventListener('mousemove', handleOrbMouse);

    // 13. Mobile Burger Toggle
    const burger = document.getElementById('navBurger');
    const navLinksList = document.querySelector('.developerPageContainer .nav-links') as HTMLElement | null;
    if (burger && navLinksList) {
      const toggleBurger = () => {
        const open = navLinksList.style.display === 'flex';
        navLinksList.style.cssText = open
          ? ''
          : 'display:flex;position:absolute;top:100%;left:0;right:0;background:rgba(3,3,10,.95);backdrop-filter:blur(20px);flex-direction:column;padding:20px;border-bottom:1px solid var(--line)';
      };
      burger.addEventListener('click', toggleBurger);

      navLinksList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinksList.style.cssText = '';
        });
      });
    }

    // 14. Back To Top
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      const handleBttScroll = () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      };
      window.addEventListener('scroll', handleBttScroll);

      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      backToTopBtn.addEventListener('click', scrollToTop);
    }

    // 15. Reveal on Scroll for Panels
    const reveal = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            (en.target as HTMLElement).style.animation = 'lineReveal .9s cubic-bezier(.2,.8,.2,1) forwards';
            reveal.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document
      .querySelectorAll('.developerPageContainer .section .panel, .developerPageContainer .section-head, .developerPageContainer .featured-card')
      .forEach(el => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(40px)';
        reveal.observe(el);
      });

    // Cleanup function on unmount
    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameId);
      cancelAnimationFrame(particleFrameId);
      clearInterval(rotatorInterval);
      clearInterval(loaderInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleMouseGlow);
      window.removeEventListener('mousemove', handleOrbMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://techysender.vercel.app/' },
    { name: 'Developer', url: 'https://techysender.vercel.app/developer' },
  ]);

  return (
    <div className="developerPageContainer">
      <SEO
        title="Shaikh Ammar — CEO & Founder of TechyBoy | TECHYSENDER Developer"
        description="Meet Shaikh Ammar Mohmmad Yasin — Full Stack Developer, AI Builder, and Founder of TechyBoy. Discover capabilities, portfolio, and founder path."
        canonical="https://techysender.vercel.app/developer"
        structuredData={breadcrumbs}
      />

      {/* CUSTOM CURSOR */}
      <div className="cursor-dot" id="cursorDot"></div>
      <div className="cursor-ring" id="cursorRing"></div>

      {/* LOADER */}
      <div className="loader" id="loader">
        <div className="loader-grid"></div>
        <div className="loader-content">
          <div className="loader-logo">
            <span className="brk">[</span>
            <span className="loader-text">TECHYBOY</span>
            <span className="brk">]</span>
          </div>
          <div className="loader-bar">
            <div className="loader-fill" id="loaderFill"></div>
          </div>
          <div className="loader-status">
            <span id="loaderPercent">00</span>% &mdash; <span id="loaderMsg">INITIALIZING SYSTEM</span>
          </div>
          <div className="loader-rings">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* BACKGROUND LAYERS */}
      <canvas id="particles"></canvas>
      <div className="grid-overlay"></div>
      <div className="scan-lines"></div>
      <div className="mouse-glow" id="mouseGlow"></div>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* NAV */}
      <nav className="nav" id="nav">
        <div className="nav-inner">
          <a href="#hero" className="nav-logo">
            <div className="logo-mark">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M5 5 L20 5 L20 20 L35 20 L35 35 L20 35 L20 20 L5 20 Z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span>AMMAR<b>SHAIKH</b></span>
          </a>
          <ul className="nav-links">
            <li><a href="#hero" data-num="01">Home</a></li>
            <li><a href="#about" data-num="02">About</a></li>
            <li><a href="#skills" data-num="03">Skills</a></li>
            <li><a href="#projects" data-num="04">Projects</a></li>
            <li><a href="#timeline" data-num="05">Path</a></li>
            <li><a href="#contact" data-num="06">Contact</a></li>
          </ul>
          <div className="nav-cta">
            <span className="status-dot"></span>
            <span>ONLINE</span>
          </div>
          <button className="nav-burger" id="navBurger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-frame">
          <div className="hud-corner tl"></div>
          <div className="hud-corner tr"></div>
          <div className="hud-corner bl"></div>
          <div className="hud-corner br"></div>
        </div>

        <div className="hero-grid">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="pulse-dot"></span>
              <span>SYSTEM ACTIVE // FOUNDER MODE</span>
            </div>

            <h1 className="hero-title" id="heroTitle">
              <span className="line">SHAIKH</span>
              <span className="line">AMMAR</span>
              <span className="line gradient">MOHMMAD</span>
              <span className="line">YASIN</span>
            </h1>

            <div className="hero-rotator">
              <span className="rot-prefix">&gt;_</span>
              <div className="rot-stage">
                <span className="rot-item active">CEO OF TECHYBOY</span>
                <span className="rot-item">FUTURE TECH FOUNDER</span>
                <span className="rot-item">FULL STACK CREATOR</span>
                <span className="rot-item">AI POWERED BUILDER</span>
                <span className="rot-item">CYBERPUNK DEVELOPER</span>
                <span className="rot-item">DIGITAL ARCHITECT</span>
              </div>
              <span className="rot-cursor">|</span>
            </div>

            <p className="hero-sub">
              Building the next generation of intelligent products. Founder of <b>TechyBoy</b> — a tech studio
              crafting AI-driven, cinematic digital experiences for ambitious brands.
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary magnetic">
                <span className="btn-glow"></span>
                <span className="btn-text">EXPLORE PORTFOLIO</span>
                <span className="btn-arrow">&rarr;</span>
              </a>
              <a href="#projects" className="btn btn-ghost magnetic">
                <span className="btn-text">VIEW PROJECTS</span>
              </a>
              <a href="#contact" className="btn btn-ghost magnetic">
                <span className="btn-text">CONTACT ME</span>
              </a>
            </div>

            <div className="hero-meta">
              <div><span className="m-num">10+</span><span className="m-lbl">Monthly Clients</span></div>
              <div><span className="m-num">10</span><span className="m-lbl">Team Members</span></div>
              <div><span className="m-num">02</span><span className="m-lbl">Hackathons</span></div>
              <div><span className="m-num">01</span><span className="m-lbl">Webathon Win</span></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="holo-frame" id="holoFrame">
              <div className="holo-rings">
                <div className="ring r1"></div>
                <div className="ring r2"></div>
                <div className="ring r3"></div>
              </div>
              <div className="holo-core">
                <div className="holo-avatar">
                  <img
                    src="https://www.image2url.com/r2/default/images/1778470270012-67aaa600-c18b-42ec-98d6-b16631964777.jpeg"
                    alt="Shaikh Ammar"
                    className="avatar-img"
                  />
                  <div className="avatar-scan"></div>
                </div>
                <div className="holo-id">
                  <div className="id-row"><span>ID</span><b>#TBY-0001</b></div>
                  <div className="id-row"><span>ROLE</span><b>FOUNDER / CEO</b></div>
                  <div className="id-row"><span>LOC</span><b>GANPAT.UNI</b></div>
                  <div className="id-row"><span>STATUS</span><b className="ok">OPERATIONAL</b></div>
                </div>
              </div>
              <div className="holo-particles">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <a href="#about" className="scroll-indicator">
          <span>SCROLL</span>
          <div className="scroll-line">
            <div className="scroll-dot"></div>
          </div>
        </a>
      </section>

      {/* ABOUT */}
      <section className="section about" id="about">
        <div className="section-head">
          <div className="sec-num">// 02</div>
          <h2 className="sec-title">ABOUT <span className="gradient">OPERATOR</span></h2>
          <div className="sec-line"></div>
        </div>

        <div className="about-grid">
          <div className="terminal panel">
            <div className="panel-bar">
              <span className="dots"><i></i><i></i><i></i></span>
              <span className="panel-title">profile.scan()</span>
              <span className="panel-meta">SECURE</span>
            </div>
            <div className="terminal-body">
              <p><span className="prompt">root@techyboy:~$</span> identify --self</p>
              <p className="t-out">// Founder. Builder. Ruthless executor.</p>
              <p>
                I&apos;m <b>Shaikh Ammar Mohmmad Yasin</b> — Founder &amp; CEO of <b className="cyan">TechyBoy</b>, a
                future-driven tech studio. As a Diploma IT student at <b>Ganpat University</b>, I lead a sharp
                10-person team shipping websites, applications, and AI-powered products to 10+ monthly clients.
              </p>
              <p>
                I think like a founder, code like a hacker, and design like an artist. Fast learning, aggressive
                execution, and a vision for the next decade of computing — that&apos;s the operating system I run on.
              </p>
              <p><span className="prompt">root@techyboy:~$</span> mission.show()</p>
              <p className="t-out">
                // Build intelligent, cinematic, scalable digital products that make brands feel like the future.
              </p>
            </div>
          </div>

          <div className="about-stats">
            <div className="stat-card panel">
              <div className="stat-num" data-count="10">0</div>
              <div className="stat-label">Monthly Clients</div>
              <div className="stat-bar"><i></i></div>
            </div>
            <div className="stat-card panel">
              <div className="stat-num" data-count="10">0</div>
              <div className="stat-label">Team Members</div>
              <div className="stat-bar"><i style={{ width: '90%' }}></i></div>
            </div>
            <div className="stat-card panel">
              <div className="stat-num" data-count="2">0</div>
              <div className="stat-label">Hackathons</div>
              <div className="stat-bar"><i style={{ width: '60%' }}></i></div>
            </div>
            <div className="stat-card panel">
              <div className="stat-num" data-count="1">0</div>
              <div className="stat-label">Webathon Win</div>
              <div className="stat-bar"><i style={{ width: '100%' }}></i></div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="section skills" id="skills">
        <div className="section-head">
          <div className="sec-num">// 03</div>
          <h2 className="sec-title">CAPABILITY <span className="gradient">MATRIX</span></h2>
          <div className="sec-line"></div>
        </div>

        <div className="skill-grid">
          <div className="skill-card" data-skill="HTML">
            <div className="sc-glow"></div>
            <div className="sc-icon">&lt;/&gt;</div>
            <h3>HTML</h3><span>Semantic Architecture</span>
            <div className="sc-bar"><i style={{ width: '98%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="CSS">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#123; &#125;</div>
            <h3>CSS</h3><span>Cinematic Styling</span>
            <div className="sc-bar"><i style={{ width: '96%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="JS">
            <div className="sc-glow"></div>
            <div className="sc-icon">JS</div>
            <h3>JavaScript</h3><span>Interactive Logic</span>
            <div className="sc-bar"><i style={{ width: '92%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="JAVA">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9749;</div>
            <h3>Java</h3><span>OOP Engineering</span>
            <div className="sc-bar"><i style={{ width: '80%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="C">
            <div className="sc-glow"></div>
            <div className="sc-icon">&copy;</div>
            <h3>C Language</h3><span>Low-Level Mastery</span>
            <div className="sc-bar"><i style={{ width: '78%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="UIUX">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9680;</div>
            <h3>UI / UX</h3><span>Experience Design</span>
            <div className="sc-bar"><i style={{ width: '94%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="GFX">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#10022;</div>
            <h3>Graphic Design</h3><span>Visual Identity</span>
            <div className="sc-bar"><i style={{ width: '88%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="HACK">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9091;</div>
            <h3>Ethical Hacking</h3><span>Security Mindset</span>
            <div className="sc-bar"><i style={{ width: '75%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="AI">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9881;</div>
            <h3>AI Tools</h3><span>Augmented Workflow</span>
            <div className="sc-bar"><i style={{ width: '95%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="GPT">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9670;</div>
            <h3>ChatGPT</h3><span>Reasoning Engine</span>
            <div className="sc-bar"><i style={{ width: '96%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="CL">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9650;</div>
            <h3>Claude</h3><span>Deep Thinking AI</span>
            <div className="sc-bar"><i style={{ width: '94%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="CR">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9654;</div>
            <h3>Cursor</h3><span>AI IDE Power</span>
            <div className="sc-bar"><i style={{ width: '93%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="KIRO">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9672;</div>
            <h3>Kiro</h3><span>Agent Workflows</span>
            <div className="sc-bar"><i style={{ width: '90%' }}></i></div>
          </div>
          <div className="skill-card" data-skill="COMM">
            <div className="sc-glow"></div>
            <div className="sc-icon">&#9517;</div>
            <h3>Communication</h3><span>Founder Voice</span>
            <div className="sc-bar"><i style={{ width: '95%' }}></i></div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section projects" id="projects">
        <div className="section-head">
          <div className="sec-num">// 04</div>
          <h2 className="sec-title">FEATURED <span className="gradient">DEPLOYMENTS</span></h2>
          <div className="sec-line"></div>
        </div>

        <div className="featured">
          <div className="featured-card">
            <div className="fc-glow"></div>
            <div className="fc-grid"></div>

            <div className="fc-left">
              <div className="fc-tag">FLAGSHIP // AI PLATFORM</div>
              <h3 className="fc-title">DEBAT <span className="gradient">AI</span></h3>
              <p className="fc-desc">
                An AI-powered debate platform that <b>reasons intelligently</b>, debates with users in real-time,
                judges multi-person debates, and assists in <b>political and office decision-making</b>. Engineered to
                think — not just respond.
              </p>

              <div className="fc-features">
                <div><span>&#9670;</span> Intelligent multi-turn reasoning</div>
                <div><span>&#9670;</span> Real-time AI debate engine</div>
                <div><span>&#9670;</span> Multi-user debate judging</div>
                <div><span>&#9670;</span> Strategic decision assistant</div>
              </div>

              <div className="fc-stack">
                <span>AI</span><span>JavaScript</span><span>LLM</span><span>UI/UX</span><span>Realtime</span>
              </div>

              <div className="fc-actions">
                <a href="https://reason-duel.emergent.host/" target="_blank" rel="noopener noreferrer" className="btn btn-primary magnetic">
                  <span className="btn-glow"></span>
                  <span className="btn-text">OPEN PROJECT</span>
                  <span className="btn-arrow">&#8599;</span>
                </a>
                <a href="https://reason-duel.emergent.host/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost magnetic">
                  <span className="btn-text">LIVE PREVIEW</span>
                </a>
              </div>
            </div>

            <div className="fc-right">
              <div className="preview-window">
                <div className="pw-bar">
                  <span className="dots"><i></i><i></i><i></i></span>
                  <span className="pw-url">reason-duel.emergent.host</span>
                  <span className="pw-status">&#9679; LIVE</span>
                </div>
                <div className="pw-screen">
                  <div className="pw-row pw-head">
                    <span>DEBATE SESSION #1138</span><span className="ok">ACTIVE</span>
                  </div>
                  <div className="pw-msg user"><b>USER:</b> Should AI judge political debates?</div>
                  <div className="pw-msg ai">
                    <b>AI:</b> Analyzing argument structure... evaluating logic chains, bias vectors, and rhetorical fallacies.
                  </div>
                  <div className="pw-bars">
                    <div className="pw-bar-row">
                      <span>LOGIC</span>
                      <div><i style={{ width: '88%' }}></i></div>
                      <b>88%</b>
                    </div>
                    <div className="pw-bar-row">
                      <span>EVIDENCE</span>
                      <div><i style={{ width: '74%' }}></i></div>
                      <b>74%</b>
                    </div>
                    <div className="pw-bar-row">
                      <span>CLARITY</span>
                      <div><i style={{ width: '92%' }}></i></div>
                      <b>92%</b>
                    </div>
                  </div>
                  <div className="pw-msg ai">
                    <b>VERDICT:</b> Debater A leads on logic + clarity. Synthesizing recommendation...
                  </div>
                  <div className="pw-typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section timeline-sec" id="timeline">
        <div className="section-head">
          <div className="sec-num">// 05</div>
          <h2 className="sec-title">FOUNDER <span className="gradient">PATH</span></h2>
          <div className="sec-line"></div>
        </div>

        <div className="timeline">
          <div className="t-line"></div>

          <div className="t-item">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 01</div>
              <h3>Started as a Coder</h3>
              <p>Began my journey learning HTML, CSS, JavaScript and quickly mastering Java &amp; C. Built obsession with quality and craft.</p>
            </div>
          </div>

          <div className="t-item right">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 02</div>
              <h3>Webathon Winner &#127942;</h3>
              <p>Took first place at Webathon — proved execution speed and design vision under high pressure.</p>
            </div>
          </div>

          <div className="t-item">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 03</div>
              <h3>Hackathon Operator</h3>
              <p>Participated in 2 hackathons — sharpened rapid prototyping, AI integration, and leadership instincts.</p>
            </div>
          </div>

          <div className="t-item right">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 04</div>
              <h3>Founded TechyBoy</h3>
              <p>Launched TechyBoy — a futuristic tech studio building websites, apps, and AI products for ambitious brands.</p>
            </div>
          </div>

          <div className="t-item">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 05</div>
              <h3>Built a 10-Person Team</h3>
              <p>Recruited and led a sharp 10-person team — designers, developers, and strategists shipping at startup speed.</p>
            </div>
          </div>

          <div className="t-item right">
            <div className="t-node"></div>
            <div className="t-card panel">
              <div className="t-meta">MILESTONE 06</div>
              <h3>10+ Monthly Clients</h3>
              <p>Scaled TechyBoy to consistently serve 10+ paying clients per month while shipping flagship products like Debat AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section contact" id="contact">
        <div className="section-head">
          <div className="sec-num">// 06</div>
          <h2 className="sec-title">OPEN <span className="gradient">CHANNEL</span></h2>
          <div className="sec-line"></div>
        </div>

        <div className="contact-grid">
          <div className="contact-info panel">
            <div className="panel-bar">
              <span className="dots"><i></i><i></i><i></i></span>
              <span className="panel-title">comm.link()</span>
              <span className="panel-meta ok">&#9679; SECURE</span>
            </div>
            <div className="contact-body">
              <h3>Let&apos;s build something <span className="gradient">unforgettable.</span></h3>
              <p>Got a vision? A startup idea? A product that needs cinematic execution? I&apos;m a transmission away.</p>

              <div className="socials">
                <a href="https://www.instagram.com/ammar2712009?igsh=MnlxOXUwcnptcWxs" target="_blank" rel="noopener noreferrer" className="soc magnetic" aria-label="Instagram">
                  <span>IG</span><b>Instagram</b>
                </a>
                <a href="https://www.facebook.com/share/1KBPjP7WGQ/" target="_blank" rel="noopener noreferrer" className="soc magnetic" aria-label="Facebook">
                  <span>FB</span><b>Facebook</b>
                </a>
                <a href="https://www.linkedin.com/in/ammar-shaikh-2107b7387" target="_blank" rel="noopener noreferrer" className="soc magnetic" aria-label="LinkedIn">
                  <span>IN</span><b>LinkedIn</b>
                </a>
                <a href="https://github.com/aqmmarshaikh?tab=repositories" target="_blank" rel="noopener noreferrer" className="soc magnetic" aria-label="GitHub">
                  <span>GH</span><b>GitHub</b>
                </a>
                <a href="mailto:ammarshaikh6100@gmail.com" className="soc magnetic" aria-label="email">
                  <span>@</span><b>Email</b>
                </a>
                <a href="https://wa.me/917801986978" target="_blank" rel="noopener noreferrer" className="soc magnetic" aria-label="WhatsApp">
                  <span>WA</span><b>WhatsApp</b>
                </a>
                <a href="tel:+917801986978" className="soc magnetic" aria-label="Phone">
                  <span>&#9742;</span><b>Phone</b>
                </a>
              </div>
            </div>
          </div>

          <form
            className="contact-form panel"
            id="contactForm"
            onSubmit={e => {
              e.preventDefault();
              const sendText = document.getElementById('sendText');
              if (sendText) {
                sendText.textContent = '✓ SIGNAL TRANSMITTED';
                setTimeout(() => {
                  sendText.textContent = 'TRANSMIT MESSAGE';
                }, 3000);
              }
            }}
          >
            <div className="panel-bar">
              <span className="dots"><i></i><i></i><i></i></span>
              <span className="panel-title">transmit.message()</span>
              <span className="panel-meta">ENCRYPTED</span>
            </div>

            <div className="form-body">
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field">
                <label>YOUR NAME</label>
                <input type="text" name="name" id="formName" required placeholder="Enter your name" minLength={2} maxLength={100} />
              </div>

              <div className="field">
                <label>EMAIL ADDRESS</label>
                <input type="email" name="email" id="formEmail" required placeholder="your@email.com" />
              </div>

              <div className="field">
                <label>PHONE NUMBER <span style={{ color: 'var(--muted)', fontSize: '11px' }}>(OPTIONAL)</span></label>
                <input type="tel" name="phone" id="formPhone" placeholder="+91 XXXXX XXXXX" pattern="[\d\s\-+()]{7,20}" />
              </div>

              <div className="field">
                <label>SUBJECT</label>
                <input type="text" name="subject" id="formSubject" required placeholder="Project / Collaboration / Inquiry" minLength={2} maxLength={200} />
              </div>

              <div className="field">
                <label>MESSAGE</label>
                <textarea name="message" id="formMessage" rows={5} required placeholder="Type your message..." minLength={10} maxLength={5000}></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-send magnetic">
              <span className="btn-glow"></span>
              <span className="btn-text" id="sendText">TRANSMIT MESSAGE</span>
              <span className="btn-arrow">&#8690;</span>
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="f-logo">TECHY<b>BOY</b></div>
            <p>Engineered by Shaikh Ammar Mohmmad Yasin. Built for the future.</p>
          </div>
          <div>
            <h4>NAVIGATE</h4>
            <a href="#hero">Home</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h4>SYSTEM</h4>
            <p>v3.0.1 // STABLE</p>
            <p>Status: <span className="ok">&#9679; OPERATIONAL</span></p>
            <p>Uptime: 100%</p>
          </div>
        </div>
        <div className="footer-bar">
          <span>&copy; <span id="year"></span> TECHYBOY // ALL RIGHTS RESERVED</span>
          <span>DESIGNED + DEPLOYED BY AMMAR</span>
        </div>
      </footer>

      {/* BACK TO TOP */}
      <button className="back-to-top" id="backToTop" aria-label="Back to Core">
        <span className="btt-glow"></span>
        <span className="btt-text">&Delta;</span>
        <span className="btt-sub">CORE</span>
      </button>
    </div>
  );
}
