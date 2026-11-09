
require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const skills = [
    // Programming Languages
    { name: "C", category: "Programming Languages" },
    { name: "C++", category: "Programming Languages" },
    { name: "Java", category: "Programming Languages" },
    { name: "Python", category: "Programming Languages" },
    { name: "JavaScript", category: "Programming Languages" },
    { name: "TypeScript", category: "Programming Languages" },
    { name: "C#", category: "Programming Languages" },
    { name: "PHP", category: "Programming Languages" },
    { name: "Go", category: "Programming Languages" },
    { name: "Rust", category: "Programming Languages" },
    { name: "Kotlin", category: "Programming Languages" },

    // Frontend Development
    { name: "HTML", category: "Frontend Development" },
    { name: "CSS", category: "Frontend Development" },
    { name: "React.js", category: "Frontend Development" },
    { name: "Next.js", category: "Frontend Development" },
    { name: "Angular", category: "Frontend Development" },
    { name: "Vue.js", category: "Frontend Development" },
    { name: "Tailwind CSS", category: "Frontend Development" },
    { name: "Bootstrap", category: "Frontend Development" },

    // Backend Development
    { name: "Node.js", category: "Backend Development" },
    { name: "Express.js", category: "Backend Development" },
    { name: "Spring Boot", category: "Backend Development" },
    { name: "Django", category: "Backend Development" },
    { name: "Flask", category: "Backend Development" },
    { name: "REST API Development", category: "Backend Development" },
    { name: "GraphQL", category: "Backend Development" },

    // Databases
    { name: "PostgreSQL", category: "Databases" },
    { name: "MySQL", category: "Databases" },
    { name: "MongoDB", category: "Databases" },
    { name: "Redis", category: "Databases" },
    { name: "SQLite", category: "Databases" },
    { name: "Database Design", category: "Databases" },

    // Computer Science Fundamentals
    { name: "Data Structures", category: "Computer Science" },
    { name: "Algorithms", category: "Computer Science" },
    { name: "Object-Oriented Programming", category: "Computer Science" },
    { name: "DBMS", category: "Computer Science" },
    { name: "Operating Systems", category: "Computer Science" },
    { name: "Computer Networks", category: "Computer Science" },
    { name: "Software Engineering", category: "Computer Science" },

    // Tools and DevOps
    { name: "Git", category: "Tools and DevOps" },
    { name: "GitHub", category: "Tools and DevOps" },
    { name: "Docker", category: "Tools and DevOps" },
    { name: "Kubernetes", category: "Tools and DevOps" },
    { name: "Linux", category: "Tools and DevOps" },
    { name: "AWS", category: "Tools and DevOps" },
    { name: "Postman", category: "Tools and DevOps" },
    { name: "CI/CD", category: "Tools and DevOps" },

    // AI and Machine Learning
    { name: "Machine Learning", category: "AI and Machine Learning" },
    { name: "Deep Learning", category: "AI and Machine Learning" },
    { name: "TensorFlow", category: "AI and Machine Learning" },
    { name: "PyTorch", category: "AI and Machine Learning" },
    { name: "Scikit-learn", category: "AI and Machine Learning" },
    { name: "Pandas", category: "AI and Machine Learning" },
    { name: "NumPy", category: "AI and Machine Learning" },
    { name: "Natural Language Processing", category: "AI and Machine Learning" },

    // Mobile Development
    { name: "Android Development", category: "Mobile Development" },
    { name: "Flutter", category: "Mobile Development" },
    { name: "React Native", category: "Mobile Development" },

    // Testing
    { name: "Jest", category: "Testing" },
    { name: "Selenium", category: "Testing" },
    { name: "JUnit", category: "Testing" },
    { name: "Unit Testing", category: "Testing" },

    // UI/UX and Design
    { name: "UI/UX Design", category: "Design" },
    { name: "Figma", category: "Design" },
];

async function main() {
    console.log("Starting SkillSync V2 skill seeding...");

    for (const skill of skills) {
        await prisma.skill.upsert({
            where: { name: skill.name },
            update: { category: skill.category },
            create: skill,
        });
    }

    console.log(`Successfully seeded ${skills.length} skills.`);
}

main()
    .catch((error) => {
        console.error("Error seeding skills:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
