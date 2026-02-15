const { body } = require("express-validator");

exports.profileValidator = [
  body("firstName").optional().trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
  body("lastName").optional().trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
  body("phone").optional().trim().isLength({ min: 6 }).withMessage("Phone must be at least 6 characters"),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must not exceed 500 characters"),
  
  body("skills").optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed);
      } catch {
        return true;
      }
    }
    return true;
  }).withMessage("Skills must be a valid array"),

  body("education").optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }).withMessage("Education must be valid JSON"),

  body("certificates").optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }).withMessage("Certificates must be valid JSON"),
];