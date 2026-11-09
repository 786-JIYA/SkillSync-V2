const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const authenticateStudent = require("../middlewares/auth.middleware");

// Get logged-in student's complete profile
router.get(
    "/me",
    authenticateStudent,
    studentController.getMyProfile
);

// Update logged-in student's profile
router.patch(
    "/me",
    authenticateStudent,
    studentController.updateMyProfile
);

// Browse student directory
router.get(
    "/",
    authenticateStudent,
    studentController.getStudentDirectory
);

// Add or update student skill
router.put(
    "/me/skills/:skillId",
    authenticateStudent,
    studentController.addStudentSkill
);

// Delete a skill from student's profile
router.delete(
    "/me/skills/:skillId",
    authenticateStudent,
    studentController.deleteStudentSkill
);

// Get skills selected by logged-in student
router.get(
    "/me/skills",
    authenticateStudent,
    studentController.getStudentSkills
);

// View another student's public profile
router.get(
    "/:studentId",
    authenticateStudent,
    studentController.getStudentProfile
);

module.exports = router;