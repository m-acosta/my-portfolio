const titles = [
  "Software Engineer",
  "Freelance Developer",
  "QA Engineer",
  "Machine Learning Engineer",
  "AI Researcher",
  "IT Professional",
  "Computer Vision Engineer",
  "Full Stack Developer",
  "QA Tester",
  "Backend Developer",
];

const skills = [
  { name: "Python", img: "img/skills/python.png" },
  { name: "C++", img: "img/skills/cpp.png" },
  { name: "Java", img: "img/skills/java.png" },
  { name: "SQL", img: "img/skills/sql.png" },
  { name: "PostgreSQL", img: "img/skills/postgresql.png" },
  { name: "HTML", img: "img/skills/html.jpg" },
  { name: "CSS", img: "img/skills/css.jpg" },
  { name: "JavaScript", img: "img/skills/javascript.jpg" },
  { name: "PyTorch", img: "img/skills/pytorch.png" },
  { name: "TensorFlow", img: "img/skills/tensorflow.png" },
  { name: "Git", img: "img/skills/git.png" },
  { name: "GitHub", img: "img/skills/github.png" },
  { name: "Docker", img: "img/skills/docker.webp" },
  { name: "Jira", img: "img/skills/jira.svg" }
];

// Typewriter Effect
const textElem = document.getElementById('typewriter-text');
const cursorElem = document.getElementById('typewriter-cursor');
let titleIndex = 0;
let charIndex = 0;
let typing = true;

function typeWriter() {
  if (!textElem || !cursorElem) return; // Prevent errors if elements are missing
  const currentTitle = titles[titleIndex];
  if (typing) {
    if (charIndex < currentTitle.length) {
      textElem.textContent += currentTitle.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 60);
    } else {
      typing = false;
      setTimeout(typeWriter, 2000); // Pause before erasing
    }
  } else {
    if (charIndex > 0) {
      textElem.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(typeWriter, 30);
    } else {
      typing = true;
      titleIndex = (titleIndex + 1) % titles.length;
      setTimeout(typeWriter, 500); // Pause before typing next
    }
  }
}
typeWriter();

// Skills Conveyor Belt
const beltTrack = document.getElementById('skills-belt-track');
if (beltTrack) {
  // Duplicate the skills to create a seamless loop
  const allSkills = [...skills, ...skills];
  beltTrack.innerHTML = allSkills.map(skill =>
    `<div class="skills-belt__item"><img src="${skill.img}" alt="${skill.name} logo" />${skill.name}</div>`
  ).join('');

  // Set the track width to allow smooth looping
  beltTrack.style.width = `${allSkills.length * 240}px`; // 220px max + 2*10px margin

  // Optionally, adjust animation duration based on content width
  const duration = allSkills.length * 1.2; // seconds
  beltTrack.style.animationDuration = `${duration}s`;
}

// Section reveal on scroll
document.addEventListener('DOMContentLoaded', () => {
  const revealSections = document.querySelectorAll('.main-section');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    },
    { threshold: 0.6 } // Reveal when 60% of the section is visible
  );
  revealSections.forEach(section => observer.observe(section));
});