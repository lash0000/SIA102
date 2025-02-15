/*
*   This feature is for Employees Information Management (HRIS)
*/

const mongoose = require('mongoose');

// HELPERS 

const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|proton\.me)$/;
const phoneNumberRegex = /^\+63\d{10}$/;
const nameRegex = /^[A-Za-z\s]+$/;

const isNameLike = (name) => {
    // Ensure the name has vowels
    const hasVowel = /[aeiouAEIOU]/.test(name);

    // Check for unrealistic repetition (e.g., "aaaaaa" or "bbb")
    const noExcessiveRepetition = !/(.)\1{3,}/.test(name);

    return hasVowel && noExcessiveRepetition;
};


// DECLARATION OF ARRAY OF OBJECTS (or NESTED)

const fullName = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        validate: [
            {
                // First validation: Basic regex check
                validator: function (value) {
                    return nameRegex.test(value);
                },
                message: 'First name must contain only letters and spaces, and cannot include special characters or numbers.',
            },
            {
                // Second validation: Ensure the name looks realistic
                validator: function (value) {
                    return isNameLike(value);
                },
                message: 'First name must look like a realistic name (e.g., no excessive repetition and must contain vowels).',
            },
        ],
    },
    middleName: {
        type: String,
        required: false,
        validate: [
            {
                validator: function (value) {
                    return !value || nameRegex.test(value); // ✅ Allow empty values
                },
                message: 'Middle name must contain only letters and spaces, and cannot include special characters or numbers.',
            },
            {
                validator: function (value) {
                    return !value || isNameLike(value); // ✅ Only validate if value exists
                },
                message: 'Middle name must look like a realistic name (e.g., no excessive repetition and must contain vowels).',
            },
        ],
    },
    lastName: {
        type: String,
        unique: true,
        required: true,
        validate: [
            {
                // First validation: Basic regex check
                validator: function (value) {
                    return nameRegex.test(value);
                },
                message: 'First name must contain only letters and spaces, and cannot include special characters or numbers.',
            },
            {
                // Second validation: Ensure the name looks realistic
                validator: function (value) {
                    return isNameLike(value);
                },
                message: 'First name must look like a realistic name (e.g., no excessive repetition and must contain vowels).',
            },
        ],
    },
    suffix: { type: String },
}, { _id: false });

const fullAddress = new mongoose.Schema({
    street: { type: String, required: false },
    subdivision_village: { type: String, required: false },
    brgy: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    postalcode: { type: Number, required: false },
}, { _id: false });

// ARRAY OF OBJECT (EXAMPLE) => Has two nodes.

const education_attainment = new mongoose.Schema({
    school_name: { type: String, required: false },
    graduated_year: { type: Number, required: false },
    started_year: { type: Number, required: false },
}, { _id: false });

const educationStructureSchema = new mongoose.Schema({
    tertiary_education: { type: education_attainment, required: false },
    secondary_education: { type: education_attainment, required: false }
}, { _id: false });

// ACTUAL SCHEMA

const employeeStaffDetails = new mongoose.Schema({
    employee_id: {
        type: Number,
        default: Math.floor(Math.random() * 8888888889) + 1111111111,
    },
    email_address: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return emailRegex.test(value);
            },
        }
    },
    phone_number: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return phoneNumberRegex.test(value);
            },
            message: 'Phone number must start with +63 and contain 10 digits (e.g.,+639123456789).',
        },
    },
    employee_name: { type: fullName, required: true },
    username: { type: String, required: true },
    employee_password: { type: String, required: true },
    employee_role: { type: [String], required: true },
    employee_work_shift: { type: String, required: false },
    civil_status: { type: String, required: false },
    current_full_address: { type: fullAddress },
    employee_nationality: { type: String, required: false },
    employee_religion: { type: String, required: false },
    employee_education_attainment: { type: [educationStructureSchema], required: true },
    generated_employee_date_added: { type: Date, default: () => new Date().toISOString() }
})

employeeStaffDetails.pre('save', async function (next) {
    const existingRecord = await StaffAccount.findOne({ employee_id: this.employee_id });
    if (existingRecord) {
        const error = new Error(`This employee record ${this.employee_id} already exists. Please try again`);
        return next(error);
    }

    // Check for duplicate email
    const existingEmail = await StaffAccount.findOne({ email_address: this.email_address });
    if (existingEmail) {
        const error = new Error(`This email ${this.email_address} is already registered.`);
        return next(error);
    }

    // Check for duplicate phone number
    const existingPhone = await StaffAccount.findOne({ phone_number: this.phone_number });
    if (existingPhone) {
        const error = new Error(`This phone number ${this.phone_number} is already registered.`);
        return next(error);
    }

    next();
})

const StaffAccount = mongoose.model('hotel_employees_staff_records', employeeStaffDetails);

module.exports = StaffAccount;