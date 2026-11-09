
const prisma = require("../lib/prisma");


const addStudentSkill = async (studentId, skillId, proficiency) => {
    // Validate skill ID
    if (
        typeof skillId !== "string" ||
        !skillId.trim()
    ) {
        const error = new Error("Valid skill ID is required");
        error.statusCode = 400;
        throw error;
    }

    // Validate proficiency (1 to 5)
    if (
        !Number.isInteger(proficiency) ||
        proficiency < 1 ||
        proficiency > 5
    ) {
        const error = new Error(
            "Proficiency must be an integer between 1 and 5"
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedSkillId = skillId.trim();

    // Check whether the skill exists
    const skill = await prisma.skill.findUnique({
        where: {
            id: normalizedSkillId
        }
    });

    if (!skill) {
        const error = new Error("Skill not found");
        error.statusCode = 404;
        throw error;
    }

    // Add the skill or update its proficiency
    const studentSkill = await prisma.studentSkill.upsert({
        where: {
            studentId_skillId: {
                studentId,
                skillId: normalizedSkillId
            }
        },
        update: {
            proficiency
        },
        create: {
            studentId,
            skillId: normalizedSkillId,
            proficiency
        }
    });

    return studentSkill;
};


const deleteStudentSkill = async (studentId, skillId) => {
    // Validate skill ID
    if (
        typeof skillId !== "string" ||
        !skillId.trim()
    ) {
        const error = new Error("Valid skill ID is required");
        error.statusCode = 400;
        throw error;
    }

    // Delete using the composite primary key
    await prisma.studentSkill.delete({
        where: {
            studentId_skillId: {
                studentId,
                skillId: skillId.trim()
            }
        }
    });

    return true;
};


// Get all skills selected by the logged-in studentconst 
getStudentSkills = async (studentId) => {
    const studentSkills = await prisma.studentSkill.findMany({
        where: {
            studentId: studentId
        },
        select: {
            proficiency: true,
            skill: {
                select: {
                    id: true,
                    name: true,
                    category: true
                }
            }
        },
        orderBy: {
            skill: {
                name: "asc"
            }
        }
    });

    return studentSkills.map((studentSkill) => ({
        id: studentSkill.skill.id,
        name: studentSkill.skill.name,
        category: studentSkill.skill.category,
        proficiency: studentSkill.proficiency
    }));
};


const getMyProfile = async (studentId) => {
    const student = await prisma.student.findUnique({
        where: {
            id: studentId
        },
        select: {
            id: true,
            prn: true,
            name: true,
            email: true,
            department: true,
            classYear: true,
            division: true,
            bio: true,
            linkedinUrl: true,
            githubUrl: true,
            createdAt: true,

            studentSkills: {
                select: {
                    proficiency: true,
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            category: true
                        }
                    }
                },
                orderBy: {
                    skill: {
                        name: "asc"
                    }
                }
            },

            createdProjects: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    preferredTeamSize: true
                }
            },

            teamMemberships: {
                select: {
                    role: true,
                    joinedAt: true,
                    team: {
                        select: {
                            id: true,
                            project: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        ...student,
        skills: student.studentSkills.map((item) => ({
            id: item.skill.id,
            name: item.skill.name,
            category: item.skill.category,
            proficiency: item.proficiency
        })),
        studentSkills: undefined
    };
};

const updateMyProfile = async (studentId, data) => {
    const allowedFields = ["bio", "linkedinUrl", "githubUrl"];

    const updates = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updates[field] = data[field];
        }
    }

    if (Object.keys(data).length === 0) {
        const error = new Error("At least one field is required");
        error.statusCode = 400;
        throw error;
    }

    if (Object.keys(updates).length !== Object.keys(data).length) {
        const error = new Error("Only bio, linkedinUrl and githubUrl can be updated");
        error.statusCode = 400;
        throw error;
    }

    if (updates.bio !== undefined &&
        updates.bio !== null &&
        (typeof updates.bio !== "string" || updates.bio.length > 500)) {
        const error = new Error("Bio must be a string with at most 500 characters");
        error.statusCode = 400;
        throw error;
    }

    for (const field of ["linkedinUrl", "githubUrl"]) {
        if (updates[field] !== undefined && updates[field] !== null && updates[field] !== "") {
            try {
                const url = new URL(updates[field]);

                if (url.protocol !== "https:" && url.protocol !== "http:") {
                    throw new Error();
                }
            } catch {
                const error = new Error(`${field} must be a valid URL`);
                error.statusCode = 400;
                throw error;
            }
        }
    }

    return prisma.student.update({
        where: { id: studentId },
        data: updates,
        select: {
            id: true,
            prn: true,
            name: true,
            email: true,
            department: true,
            classYear: true,
            division: true,
            bio: true,
            linkedinUrl: true,
            githubUrl: true,
            updatedAt: true
        }
    });
};

const getStudentDirectory = async ({
    search,
    department,
    classYear,
    page = 1,
    limit = 10
}) => {
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const where = {
        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    prn: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        }),
        ...(department && { department }),
        ...(classYear && { classYear: Number(classYear) })
    };

    const [students, total] = await prisma.$transaction([
        prisma.student.findMany({
            where,
            select: {
                id: true,
                prn: true,
                name: true,
                department: true,
                classYear: true,
                division: true,
                bio: true,
                studentSkills: {
                    select: {
                        proficiency: true,
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: "asc"
            },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize
        }),
        prisma.student.count({ where })
    ]);

    return {
        students: students.map((student) => ({
            ...student,
            skills: student.studentSkills.map((item) => ({
                id: item.skill.id,
                name: item.skill.name,
                category: item.skill.category,
                proficiency: item.proficiency
            })),
            studentSkills: undefined
        })),
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize)
        }
    };
};

const getStudentProfile = async (studentId) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            prn: true,
            name: true,
            department: true,
            classYear: true,
            division: true,
            bio: true,
            linkedinUrl: true,
            githubUrl: true,
            createdAt: true,

            studentSkills: {
                select: {
                    proficiency: true,
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            category: true
                        }
                    }
                },
                orderBy: {
                    skill: {
                        name: "asc"
                    }
                }
            },

            createdProjects: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    preferredTeamSize: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },

            teamMemberships: {
                select: {
                    role: true,
                    joinedAt: true,
                    team: {
                        select: {
                            id: true,
                            project: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        ...student,
        skills: student.studentSkills.map((item) => ({
            id: item.skill.id,
            name: item.skill.name,
            category: item.skill.category,
            proficiency: item.proficiency
        })),
        studentSkills: undefined
    };
};

module.exports = {
    addStudentSkill,
    deleteStudentSkill,
    getStudentSkills,
    getMyProfile,
    updateMyProfile,
    getStudentDirectory,
    getStudentProfile
};
