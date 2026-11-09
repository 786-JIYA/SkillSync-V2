const studentService = require("../services/student.service");

const addStudentSkill = async (req, res) => {
    try {
        const studentId = req.student.id;
        const { skillId } = req.params;
        const { proficiency } = req.body;

        const result = await studentService.addStudentSkill(
            studentId,
            skillId,
            proficiency
        );

        return res.status(200).json({
            success: true,
            message: "Student skill added successfully",
            data: result
        });

    } catch (error) {
        console.error("Add student skill error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const deleteStudentSkill = async (req, res) => {
    try {
        const studentId = req.student.id;
        const { skillId } = req.params;

        await studentService.deleteStudentSkill(studentId, skillId);

        return res.status(200).json({
            success: true,
            message: "Student skill deleted successfully",
            data: null
        });

    } catch (error) {
        console.error("Delete student skill error:", error);

        const statusCode =
            error.statusCode ||
            (error.code === "P2025" ? 404 : 500);

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500
                ? "Internal server error"
                : error.message
        });
    }
};

const getStudentSkills = async (req, res) => {
    try {
        const studentId = req.student.id;

        const skills = await studentService.getStudentSkills(studentId);

        return res.status(200).json({
            success: true,
            data: {
                skills
            }
        });
    } catch (error) {
        console.error("Get student skills error:", error);

        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500
                ? "Internal server error"
                : error.message
        });
    }
};


const getMyProfile = async (req, res) => {
    try {
        const studentId = req.student.id;

        const student = await studentService.getMyProfile(studentId);

        return res.status(200).json({
            success: true,
            data: {
                student
            }
        });
    } catch (error) {
        console.error("Get student profile error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const studentId = req.student.id;

        const student = await studentService.updateMyProfile(
            studentId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { student }
        });
    } catch (error) {
        console.error("Update student profile error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const getStudentDirectory = async (req, res) => {
    try {
        const {
            search,
            department,
            classYear,
            page,
            limit
        } = req.query;

        const result = await studentService.getStudentDirectory({
            search,
            department,
            classYear,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Get student directory error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await studentService.getStudentProfile(studentId);

        return res.status(200).json({
            success: true,
            data: { student }
        });
    } catch (error) {
        console.error("Get public student profile error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
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