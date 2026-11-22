/* =============================================================
   PORTFOLIO CONTENT — edit this file to update the site.
   Everything on the page is rendered from this one object.
   ============================================================= */
window.PORTFOLIO = {
  name: "Akshat Chaudhari",
  initials: "AC",
  roles: ["Computer Science Student", "Developer", "AI & ML Enthusiast", "Systems Experimenter"],
  heroLine:
    "I don't just learn technology. I experiment with it, break things, build systems and figure out how they work.",
  // ---- The street entrance (first screen, before the lobby) ----
  entrance: {
    badge: "CS & Business Systems · Data Science @ IIT Madras",
    headline: ["Build It. Test It.", "Understand It."],
    lead: "I don't just learn technology. I experiment with it, break things, build systems and figure out how they work.",
    primary: "Enter the building",
    secondary: "See the labs",
    doorText: ["AKSHAT", "CHAUDHARI"],
  },
  intro: [
    "I'm Akshat Chaudhari, a computer science student pursuing Computer Science & Business Systems at D.Y. Patil University and Data Science at IIT Madras.",
    "My interests lie at the intersection of software engineering, artificial intelligence, data science, backend development and experimental computing.",
  ],

  // ---- Contact links: fill these in. Empty strings are hidden on the page. ----
  contact: {
    email: "akshatamolc@gmail.com",      // also makes the contact form open your mail app
    github: "https://github.com/24f2007565-spec",
    linkedin: "",   // e.g. "https://www.linkedin.com/in/yourname"
  },

  about: {
    lead: "I'm a technology enthusiast who enjoys understanding what's happening behind the interface.",
    body: [
      "My approach to development is experimental and practical. I prefer building things, testing them, identifying problems and improving them rather than stopping at theoretical understanding.",
      "I'm particularly interested in projects that combine multiple disciplines rather than staying within a single technology.",
      "I enjoy turning ideas into working systems — whether that's building a database-driven web application, experimenting with a custom hashing algorithm, designing an infinite-world game or exploring how hardware and software interact.",
    ],
    explored: [
      "Backend & full-stack web development",
      "Python programming & algorithmic experimentation",
      "Database management & SQL",
      "Artificial intelligence & machine learning",
      "Data science & statistical exploration",
      "Game development & world-generation systems",
      "Hardware interaction & sensor-based automation",
      "Computer architecture & system-level performance",
    ],
    philosophy: ["Build it.", "Test it.", "Understand it.", "Improve it."],
  },

  education: [
    {
      school: "D.Y. Patil University",
      degree: "B.Tech — Computer Science & Business Systems (CSBS)",
      when: "Expected 2028",
      label: "Academic interests",
      items: [
        "Computer Science fundamentals",
        "Data structures & algorithms",
        "Database management systems",
        "Software engineering",
        "Computer organization & architecture",
        "Programming & application development",
      ],
    },
    {
      school: "Indian Institute of Technology Madras",
      degree: "BS — Data Science",
      when: "Expected 2028",
      label: "Areas of interest",
      items: [
        "Data analysis",
        "Statistical methods",
        "Python programming",
        "Data management",
        "Machine learning foundations",
        "Computational problem-solving",
      ],
    },
  ],
  educationNote:
    "Studying these two disciplines provides exposure to both software engineering and analytical approaches to solving technical problems.",

  skills: [
    { group: "Programming Languages", icon: "code", items: ["Python", "SQL", "Java (academic)"] },
    { group: "Web Development", icon: "globe", items: ["Flask", "HTML5", "CSS3", "Bootstrap", "Jinja2", "FastAPI"] },
    { group: "Databases", icon: "db", items: ["SQLite", "SQLAlchemy", "Relational design", "Database management", "SQL queries"] },
    { group: "Data Science & Scientific Computing", icon: "chart", items: ["NumPy", "SciPy", "Statistical exploration", "Numerical computation", "Data processing"] },
    { group: "Game Development", icon: "game", items: ["Pygame", "2D mechanics", "Collision detection", "Enemy AI", "Chunk-based worlds"] },
    { group: "Tools & Environment", icon: "tool", items: ["VS Code", "Git", "GitHub", "Python venvs", "Google Colab"] },
    { group: "Core Technical Areas", icon: "cpu", items: ["OOP", "Backend architecture", "Database integration", "Algorithm development", "Performance benchmarking", "API development", "Debugging", "Hardware & sensor integration"] },
  ],

  // scene: which 3D visual represents the project — "mountains" | "hash" | "chunks" | "motor"
  // filter: which filter chip it belongs to (must match a key in projectFilters)
  projectFilters: [
    { key: "all", label: "All" },
    { key: "web", label: "Web" },
    { key: "algo", label: "Algorithms" },
    { key: "games", label: "Games" },
    { key: "hardware", label: "Hardware" },
  ],
  projects: [
    {
      id: "trekblazer",
      num: "01",
      title: "Trekblazer",
      subtitle: "Trekking Management Application",
      filter: "web",
      category: "Full-Stack Web Development",
      language: "Python",
      scene: "mountains",
      summary:
        "A database-driven trekking platform with separate interfaces for administrators, trekking staff and trekkers — treks, participants, bookings and staff responsibilities in one centralized system.",
      tech: ["Python", "Flask", "Flask-SQLAlchemy", "SQLite", "SQLAlchemy", "Jinja2", "HTML", "CSS", "Bootstrap"],
      sections: [
        { title: "Administrator module", items: ["Trek creation and management", "Trek staff approval and assignment", "Management of trekking operations", "Administrative control over application data"] },
        { title: "Staff module", items: ["Trek management", "Participant management", "Assigned trekking activity management"] },
        { title: "Trekker module", items: ["Browse available treks", "Search and filter trekking options", "Make trekking bookings", "Access booking history"] },
        { title: "Backend & database", items: ["Role-based access control", "Separate workflows per role", "Database models and relationships", "Duplicate booking prevention", "Overbooking prevention", "Protected application routes", "Account deactivation"] },
        { title: "What I worked on", items: ["Flask backend development", "Database design and integration", "Role-based authentication & authorization", "Application routing", "Template-based frontend integration", "Git & GitHub project management"] },
      ],
      focus: "Building a practical, structured web application with multiple user roles and database-driven functionality.",
      sceneCaption: "Terrain with a live trek route — the data a booking platform organizes.",
    },
    {
      id: "rootminus7",
      num: "02",
      title: "RootMinus7 Hash",
      subtitle: "Experimental Hash Function & Computational Benchmarking",
      filter: "algo",
      category: "Algorithmic Experimentation · Scientific Computing",
      language: "Python",
      scene: "hash",
      summary:
        "An experimental custom hashing approach, explored through repeated experiments and performance measurements rather than just calling a library function.",
      tech: ["Python", "NumPy", "SciPy", "collections.deque", "CPU resource management"],
      sections: [
        { title: "Technical work", items: ["Custom hash-function implementation", "Python-based computational experiments", "Large-scale sample processing", "Hash throughput measurements", "Performance benchmarking", "Statistical exploration", "Computational optimization experiments"] },
        { title: "Experimental focus", items: ["Hashing experiments across large sample sets", "Measuring execution time", "Observing hashes generated per second", "Extended computational runs", "Exploring statistical behavior", "Performance under different execution conditions"] },
        { title: "What makes it interesting", items: ["Understanding algorithms beyond their theoretical definitions — through experimentation, measurement and observation of how computational workloads behave in practice."] },
      ],
      focus: "Custom algorithmic experimentation, computational performance and statistical investigation.",
      note: "RootMinus7 is an experimental hashing project, not a cryptographically audited or security-certified hashing standard.",
      sceneCaption: "Ordered input streams through the function and scatters into a digest.",
    },
    {
      id: "infinite-world",
      num: "03",
      title: "Infinite World",
      subtitle: "2D Pygame Platformer with Chunk-Based World Streaming",
      filter: "games",
      category: "Game Development · Game Logic",
      language: "Python",
      scene: "chunks",
      summary:
        "An experimental platformer that builds an effectively continuous world from six handcrafted chunks — only three loaded at a time, rotating in a circle.",
      tech: ["Python", "Pygame", "OOP", "Game physics", "Chunk-based world management"],
      sections: [
        { title: "Core gameplay", items: ["Player movement & jumping", "Platform-based navigation", "Collectible coins", "Enemy interactions", "Health mechanics", "Camera scrolling", "Collision detection", "Gravity & movement physics", "Progressive difficulty"] },
        { title: "World generation & streaming", items: ["Six handcrafted, fixed-width world chunks", "Three active chunks loaded simultaneously", "Circular chunk rotation", "Platforms and coins tied to their chunk", "Continuous progression, no teleport wrapping", "Past the final chunk, the first is reused"] },
        { title: "Enemy AI", items: ["Enemy movement logic", "Player-following behavior", "Chasing mechanics", "Collision-based interactions"] },
      ],
      focus: "Game architecture, memory-conscious world management, enemy behavior and real-time game logic.",
      note: "The chunk-streaming design is an ongoing technical direction, not a claim that every proposed feature is complete.",
      sceneCaption: "Three active chunks; the one that scrolls off is recycled to the front.",
    },
    {
      id: "motor-automation",
      num: "04",
      title: "Sensor-Based Motor Automation",
      subtitle: "IR Detection & Timed Relay Control",
      filter: "hardware",
      category: "Embedded Systems · Hardware Interaction",
      language: "Arduino-style C",
      scene: "motor",
      summary:
        "A hardware-control experiment: an infrared sensor and a relay-controlled motor that switches off when an object is detected, then restarts after 10 seconds.",
      tech: ["IR sensor", "Relay module", "Motor", "Microcontroller GPIO", "Arduino-style programming"],
      sections: [
        { title: "Working logic", ordered: true, items: ["The motor starts in the ON state", "The IR sensor continuously monitors for an object", "When an object is detected, the motor switches OFF", "The system waits for 10 seconds", "The motor switches ON again"] },
        { title: "Technical concepts", items: ["Digital input/output", "Sensor-based detection", "Relay switching", "Conditional execution", "Timed control", "Hardware-software interaction"] },
      ],
      focus: "Connecting programming logic with real-world hardware behavior.",
      sceneCaption: "Object breaks the IR beam → relay cuts the motor → timed restart.",
    },
  ],

  interests: [
    { title: "Artificial Intelligence & Machine Learning", text: "Exploring intelligent systems, model development, machine learning applications and computational approaches to real-world problems." },
    { title: "Data Science", text: "Statistical analysis, data processing, computational experimentation and extracting useful information from data." },
    { title: "Software Engineering", text: "Building backend systems, database-driven applications and practical software solutions." },
    { title: "Algorithmic Computing", text: "Experimenting with custom algorithms, performance measurement and computational behavior." },
    { title: "Game Development", text: "Game mechanics, AI-driven enemies, world generation and efficient rendering systems." },
    { title: "Hardware & Automation", text: "The connection between software, sensors, electronic components and automated systems." },
  ],

  approach: [
    { title: "Experimentation over assumptions.", text: "A system should be tested rather than judged only by how good it looks on paper." },
    { title: "Understand the architecture.", text: "How components communicate — from databases and APIs to processors and hardware." },
    { title: "Improve through iteration.", text: "Debugging, benchmarking and refining are core parts of my development process." },
    { title: "Build across disciplines.", text: "Combining programming, analytical thinking, software architecture and hardware interaction." },
  ],

  learning: [
    "Advanced Python", "Data structures & algorithms", "Machine learning foundations", "Database optimization",
    "Backend architecture", "Computer organization & architecture", "Parallel computing", "GPU computing",
    "Computational performance", "AI/ML applications",
  ],
  learningNote: "I aim to develop stronger engineering fundamentals while continuing to build practical projects.",

  beyond: {
    lead: "Technology is not limited to writing programs.",
    items: ["Participating in hackathons", "Exploring collaborative technical projects", "Proposing technical workshops & student initiatives", "Connecting with developers & tech communities", "Learning through practical experimentation"],
    close: "I enjoy working on ideas that can evolve from a simple concept into something functional.",
  },

  connect: {
    who: ["Developers", "AI/ML enthusiasts", "Data science students & professionals", "Software engineers", "Hackathon participants", "People building interesting technical projects"],
    text: "Whether it's collaborating on an idea, discussing technology or building something together, I'm always interested in meaningful technical conversations.",
  },

  finalThought: {
    quote: "Curiosity starts the idea. Engineering turns it into reality.",
    text: "I'm still learning, experimenting and building — and that's exactly how I want my journey in technology to continue.",
  },
};
