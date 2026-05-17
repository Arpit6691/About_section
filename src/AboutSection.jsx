import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, useScroll, animate } from 'framer-motion';
import { Globe, Award, Users, Clock, Database, Briefcase, Quote, ChevronRight, Target, Eye, Zap, ArrowRight, Sparkles } from 'lucide-react';

// --- CUSTOM SPRING CURSOR ---
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 20, stiffness: 200, mass: 0.3 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-emerald-400 bg-emerald-400/10 backdrop-blur-sm pointer-events-none z-[100] hidden lg:flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
    >
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
    </motion.div>
  );
};

// --- SPLIT TEXT ANIMATION (WORD BY WORD) ---
const AnimatedText = ({ text, className }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const child = {
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", damping: 15, stiffness: 100 } },
    hidden: { opacity: 0, y: 50, rotateX: -90 },
  };

  return (
    <motion.div
      className={`${className} flex flex-wrap justify-center md:justify-start`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      style={{ perspective: 1000 }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block", transformOrigin: "bottom" }} key={index}>
          {word === "<br/>" ? <br className="hidden md:block" /> : word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// --- NUMBER COUNTER ANIMATION ---
const AnimatedCounter = ({ from, to, suffix = "" }) => {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: 3,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, inView, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
};

// --- MAGNETIC BUTTON COMPONENT ---
const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const mouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };
  const mouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
      animate={{ x: position.x * 0.3, y: position.y * 0.3 }}
      transition={{ type: "spring", stiffness: 150, damping: 10, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

// --- PREMIUM 3D TILT & SPOTLIGHT CARD ---
const PremiumCard = ({ children, className, itemColor = "rgba(16,185,129,0.15)" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    // Disable hover tilt strictly on touch devices/small screens to prevent mobile scrolling bugs
    if (!ref.current || window.innerWidth < 1024) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    x.set(currentX / width - 0.5);
    y.set(currentY / height - 0.5);

    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setOpacity(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className={`relative group ${className}`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full w-full rounded-3xl md:rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 hidden lg:block"
          style={{
            opacity,
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${itemColor}, transparent 40%)`
            )
          }}
        />
        
        <div className="absolute inset-0 rounded-3xl md:rounded-[2rem] p-[1px] bg-gradient-to-br from-transparent to-transparent lg:group-hover:from-emerald-200 lg:group-hover:to-teal-200 transition-colors duration-700 pointer-events-none z-10" />

        <div className="relative z-20 h-full w-full flex flex-col" style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- SUBTLE PARTICLES BACKGROUND ---
const Particles = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(p);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-[#10b981] rounded-full opacity-0"
          initial={{ x: p.x, y: p.y, width: p.size, height: p.size }}
          animate={{
            y: [p.y, p.y - 500],
            opacity: [0, 0.4, 0],
            x: [p.x, p.x + (Math.random() - 0.5) * 150]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// --- DATA ---
const highlights = [
  { id: 1, value: 50, suffix: '+', title: 'Hours', subtitle: 'Structured Learning', description: 'Immerse yourself in comprehensive modules covering public policy frameworks and sustainable development goals.', icon: Clock, color: 'from-[#10b981] to-[#14b8a6]', glow: 'rgba(16,185,129,0.12)' },
  { id: 2, value: 100, suffix: '%', title: 'Data Focus', subtitle: 'Literacy & Statistics', description: 'Master practical data science tools, statistical analysis, and AI to craft evidence-based policy solutions.', icon: Database, color: 'from-[#059669] to-[#0ea5e9]', glow: 'rgba(5,150,105,0.12)' },
  { id: 3, value: 1, suffix: '', title: 'Capstone', subtitle: 'Applied Real-world', description: 'Execute a hands-on final project addressing a real-world challenge, guided by seasoned industry experts.', icon: Briefcase, color: 'from-[#0ea5e9] to-[#14b8a6]', glow: 'rgba(14,165,233,0.12)' },
  { id: 4, value: 10, suffix: 'k+', title: 'Alumni', subtitle: 'Excellence Recognition', description: 'Join a thriving global network of professionals and researchers driving meaningful public impact.', icon: Award, color: 'from-[#3b82f6] to-[#10b981]', glow: 'rgba(59,130,246,0.12)' },
  { id: 5, value: 50, suffix: '+', title: 'Publications', subtitle: 'Research Opportunities', description: 'Gain opportunities to publish your policy papers and research findings in globally recognized journals.', icon: Globe, color: 'from-[#14b8a6] to-[#3b82f6]', glow: 'rgba(20,184,166,0.12)' },
  { id: 6, value: 120, suffix: '+', title: 'Experts', subtitle: 'From Policy Experts', description: 'Learn directly from an elite faculty of policymakers, data scientists, and international development leaders.', icon: Users, color: 'from-[#10b981] to-[#0ea5e9]', glow: 'rgba(16,185,129,0.12)' },
];

const timeline = [
  { phase: "Phase 1", title: "Foundational Knowledge", desc: "Building the core understanding of public policy frameworks and sustainable development goals." },
  { phase: "Phase 2", title: "Data & Analytics", desc: "Mastering statistics, AI tools, and data literacy for evidence-based decision making." },
  { phase: "Phase 3", title: "Global Application", desc: "Executing applied capstone projects with real-world impact and policy publications." }
];

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const slideInList = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function AboutSection() {
  const { scrollYProgress } = useScroll();
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yParallaxFast = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const yParallaxSlow = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const rotateShape = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  const timelineRef = useRef(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  return (
    <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-white text-slate-900 font-sans selection:bg-emerald-200/50 cursor-none lg:cursor-auto">
      
      <CustomCursor />

      {/* --- CINEMATIC LIGHT GREEN BACKGROUND & TECH GRID --- */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98122_1px,transparent_1px)] [background-size:24px_24px] opacity-70 z-0 pointer-events-none" />
      <Particles />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: yBg }} className="absolute inset-0 opacity-60">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0], x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] lg:w-[50%] lg:h-[50%] bg-gradient-to-br from-[#d1fae5] to-[#f0fdf4] blur-[100px] lg:blur-[130px] rounded-[100%] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -30, 0], x: [0, -40, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] lg:w-[45%] lg:h-[45%] bg-gradient-to-br from-white to-[#ccfbf1] blur-[100px] lg:blur-[120px] rounded-[100%] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute bottom-[-10%] left-[20%] w-[80%] h-[80%] lg:w-[50%] lg:h-[50%] bg-gradient-to-br from-[#f0fdf4] to-[#a7f3d0] blur-[120px] lg:blur-[140px] rounded-[100%] mix-blend-multiply" 
          />
        </motion.div>
      </div>

      {/* --- GEOMETRIC FLOATING SHAPES (PARALLAX & ROTATION) --- */}
      <motion.div style={{ y: yParallaxFast, rotate: rotateShape }} className="absolute top-1/4 left-5 w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-white to-[#ecfdf5] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] opacity-70 backdrop-blur-2xl hidden xl:block pointer-events-none" />
      <motion.div style={{ y: yParallaxSlow, rotate: useTransform(scrollYProgress, [0, 1], [0, -360]) }} className="absolute bottom-1/4 right-5 w-40 h-40 rounded-full bg-gradient-to-tr from-white to-[#f0fdfa] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] opacity-70 backdrop-blur-2xl hidden xl:block pointer-events-none flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border border-[#a7f3d0]/50" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center max-w-5xl mx-auto mb-20 lg:mb-32 flex flex-col items-center"
        >
          <Magnetic>
            <div className="inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full bg-white border border-slate-200/60 backdrop-blur-xl mb-8 lg:mb-10 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs lg:text-sm font-bold tracking-widest uppercase text-slate-700">About IISPPR Academy</span>
            </div>
          </Magnetic>
          
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 lg:mb-8 leading-[1.1] lg:leading-[1.05] tracking-tight text-slate-900 w-full">
            <AnimatedText text="International Institute of" className="justify-center" />
            <span className="relative inline-block mt-1 lg:mt-2">
              <AnimatedText text="SDGs & Public Policy" className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#059669] to-[#0ea5e9] justify-center pb-2" />
              <motion.span 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#10b981] to-[#0ea5e9] rounded-full opacity-50"
              />
            </span>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-light px-2"
          >
            We offer a globally structured online program in Public Policy & Data Science, designed for students, professionals, and aspiring researchers.
          </motion.p>
        </motion.div>

        {/* --- THE FLAGSHIP COURSE & 3D QUOTE --- */}
        <div className="mb-24 lg:mb-40 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <motion.div variants={fadeIn} className="inline-block px-4 py-1.5 rounded-full bg-[#ecfdf5] text-[#059669] font-semibold text-sm mb-6 border border-[#a7f3d0]">
              Flagship Course
            </motion.div>
            <motion.h3 variants={fadeIn} className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 lg:mb-8 text-slate-900 tracking-tight">Master Policy & Data</motion.h3>
            <motion.p variants={fadeIn} className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 lg:mb-10 font-light">
              This flagship course blends rigorous policy analysis with practical data science tools, helping learners understand how policies are shaped—and how to influence them using data, research, and effective communication.
            </motion.p>
            <ul className="space-y-4 lg:space-y-6">
              {[
                "Decode complex systems in governance & education",
                "Apply data literacy and statistics responsibly",
                "Communicate insights that create real-world impact"
              ].map((item, i) => (
                <motion.li variants={slideInList} key={i} className="flex items-start lg:items-center gap-4 lg:gap-5 text-slate-700 text-base sm:text-lg font-medium group">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-100 group-hover:scale-110 group-hover:bg-[#10b981] group-hover:text-white transition-all duration-300 mt-0.5 lg:mt-0">
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="flex-1 leading-snug">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Floating Quote Card */}
          <PremiumCard className="w-full h-full" itemColor="rgba(16,185,129,0.1)">
            <div className="relative p-8 sm:p-10 lg:p-16 h-full flex flex-col justify-center">
              <motion.div style={{ transform: "translateZ(60px)" }} className="relative z-10 lg:block hidden">
                <Quote className="w-16 h-16 text-[#10b981]/30 mb-8 drop-shadow-md" />
              </motion.div>
              
              <h4 style={{ transform: "translateZ(50px)" }} className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 lg:mb-8 leading-snug relative z-10 tracking-tight">
                Why This Program Matters
              </h4>
              
              <p style={{ transform: "translateZ(30px)" }} className="text-lg sm:text-xl text-slate-600 leading-relaxed font-light italic relative z-10">
                "In a world where policy decisions shape education, governance, and climate action, IISPPR empowers learners to decode complex systems, apply data responsibly, and communicate insights that create real-world impact."
              </p>
              
              <motion.div 
                animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-[#10b981]/10 to-[#0ea5e9]/10 rounded-full blur-2xl lg:blur-3xl pointer-events-none"
              />
            </div>
          </PremiumCard>
        </div>

        {/* --- ANIMATED JOURNEY TIMELINE --- */}
        <div className="mb-24 lg:mb-40 relative">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-16 lg:mb-24"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 lg:mb-6 text-slate-900 tracking-tight">The Learning Journey</h3>
            <p className="text-slate-500 text-lg sm:text-xl font-light px-2">A structured, world-class approach to mastering policy</p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative" ref={timelineRef}>
            <div className="absolute left-[31px] md:left-[39px] top-6 md:top-10 bottom-10 w-[2px] bg-slate-200" />
            <motion.div 
              style={{ scaleY: timelineProgress, transformOrigin: "top" }} 
              className="absolute left-[31px] md:left-[39px] top-6 md:top-10 bottom-10 w-[2px] bg-gradient-to-b from-[#10b981] via-[#059669] to-[#0ea5e9] shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            />

            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative flex items-start gap-6 md:gap-10 mb-12 lg:mb-16 group"
              >
                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-md lg:shadow-lg border border-slate-100 flex items-center justify-center flex-shrink-0 lg:group-hover:scale-110 lg:group-hover:border-[#10b981] transition-all duration-500 ease-out overflow-hidden mt-1 md:mt-0">
                  <div className="absolute inset-0 bg-emerald-50 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-[#10b981] to-[#0ea5e9] shadow-inner flex items-center justify-center">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping opacity-80" />
                  </div>
                </div>
                
                <PremiumCard className="w-full" itemColor="rgba(16,185,129,0.05)">
                  <div className="p-6 md:p-10 h-full flex flex-col justify-center">
                    <span style={{ transform: "translateZ(20px)" }} className="inline-block self-start text-xs lg:text-sm font-bold text-[#10b981] tracking-widest uppercase mb-3 lg:mb-4 px-3 py-1 lg:px-4 lg:py-1.5 bg-emerald-50 rounded-full border border-emerald-100/50">
                      {item.phase}
                    </span>
                    <h4 style={{ transform: "translateZ(40px)" }} className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 lg:mb-4 tracking-tight">{item.title}</h4>
                    <p style={{ transform: "translateZ(30px)" }} className="text-slate-600 text-base lg:text-lg leading-relaxed font-light">{item.desc}</p>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- PROGRAM HIGHLIGHTS GRID WITH DETAILED DESCRIPTIONS --- */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
          className="mb-16 lg:mb-20 text-center"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 lg:mb-6 text-slate-900 tracking-tight">Program Highlights</h3>
          <p className="text-slate-500 text-lg sm:text-xl font-light px-2">Key features of our globally structured curriculum</p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mb-24 lg:mb-32"
        >
          {highlights.map((item, index) => (
            <motion.div key={index} variants={fadeIn} className="h-full">
              <PremiumCard className="h-full" itemColor={item.glow}>
                <div className="p-6 md:p-8 lg:p-10 h-full flex flex-col items-start justify-start relative lg:group-hover:-translate-y-2 transition-transform duration-500">
                    
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      style={{ transform: "translateZ(50px)" }} 
                      className={`inline-flex p-3 lg:p-4 rounded-2xl bg-gradient-to-br ${item.color} mb-5 lg:mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-white/50`}
                    >
                      <item.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-md" />
                    </motion.div>
                    
                    <h4 style={{ transform: "translateZ(40px)" }} className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-1 lg:mb-2 tracking-tight">
                      <AnimatedCounter from={0} to={item.value} suffix={item.suffix} />
                    </h4>
                    <h5 style={{ transform: "translateZ(30px)" }} className="text-lg lg:text-xl font-bold text-[#10b981] mb-1">{item.title}</h5>
                    <p style={{ transform: "translateZ(20px)" }} className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 lg:mb-5">{item.subtitle}</p>
                    
                    <div style={{ transform: "translateZ(25px)" }} className="relative overflow-hidden pt-4 lg:pt-5 border-t border-slate-100/80 w-full mt-auto flex flex-col flex-grow">
                      <p className="text-slate-500 font-light leading-relaxed text-sm lg:text-[15px] flex-grow">
                        {item.description}
                      </p>
                      
                      <div className="mt-5 lg:mt-6 flex items-center gap-2 text-[#0ea5e9] font-medium text-sm cursor-pointer group/link w-fit">
                        <span className="relative overflow-hidden inline-flex h-5">
                          <span className="inline-block transition-transform duration-300 lg:group-hover/link:-translate-y-full">Explore Module</span>
                          <span className="inline-block absolute left-0 top-0 translate-y-full transition-transform duration-300 lg:group-hover/link:translate-y-0 text-[#10b981]">Explore Module</span>
                        </span>
                        <ArrowRight className="w-4 h-4 transform transition-transform duration-300 lg:group-hover/link:translate-x-1 lg:group-hover/link:text-[#10b981]" />
                      </div>
                    </div>

                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>

        {/* --- PREMIUM CTA SECTION --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex justify-center pb-10 lg:pb-20 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-emerald-400/30 blur-[40px] rounded-full pointer-events-none z-0" />
          
          <Magnetic>
            <button className="group relative px-8 py-4 lg:px-10 lg:py-5 bg-slate-900 text-white rounded-full font-semibold text-base lg:text-lg shadow-[0_10px_40px_rgba(16,185,129,0.2)] lg:hover:shadow-[0_20px_60px_rgba(16,185,129,0.4)] lg:hover:-translate-y-1 transition-all duration-300 overflow-hidden z-10 w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10b981] to-[#0ea5e9] opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                Apply for Fellowship
                <ArrowRight className="w-5 h-5 lg:group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Magnetic>
        </motion.div>

      </div>
    </section>
  );
}
