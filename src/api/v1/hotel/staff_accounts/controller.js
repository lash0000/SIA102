/*
*   This feature is for Employees Information Management (HRIS)
*   src/api/v1/hotel/staff_accounts/controller.js
*/

const mongoose = require('mongoose');
const StaffAccount = require('./model');
const { AuditLogs } = require('../audit_logs/model');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;
const { Send } = require('../../../../../global/config/NodeMailer');
const requestIp = require('request-ip');
const platform = require('platform');
const { uploadFiles } = require('../uploads/employee_records/controller');
const HotelMediaFiles = require("../uploads/employee_records/model");

// Ensure proper database name usage in connection
const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const generateRandomPassword = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    const passwordLength = Math.floor(Math.random() * (20 - 8 + 1)) + 8;

    for (let i = 0; i < passwordLength; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
};

// GET METHOD (BY ALL)

const getAllRecords = async (req, res) => {
    try {
        await connectToDB();
        const employee_records = await StaffAccount.find();
        res.status(200).json(employee_records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee record data', error });
    }
};

// GET METHOD (PER ID)

const getRecordById = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;
        const employeeRecord = await StaffAccount.findOne({ employee_id: id })
            .populate('created_by', '_id employee_id email_address employee_name username employee_role');

        if (!employeeRecord) {
            return res.status(404).json({ message: 'Employee record not found' });
        }

        res.status(200).json(employeeRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching record data', error });
    }
};

// POST METHOD (NEEDS VALIDATION)

const createRecord = async (req, res) => {
    try {
        await connectToDB();
        const employeeRecordData = req.body;

        // Duplicate checks, only considering employee_id and email_address now
        const duplicateChecks = await StaffAccount.findOne({
            $or: [
                { email_address: employeeRecordData.email_address },
            ],
        });

        if (duplicateChecks) {
            let duplicateField;

            // idk what happen
            if (duplicateChecks.email_address === employeeRecordData.email_address) {
                duplicateField = 'email_address';
            }

            return res.status(400).json({
                message: `This employee record account information with ${duplicateField} already exists.`,
            });
        }

        // Validate that password is strong
        if (employeeRecordData.employee_password) {
            const hashedPassword = await bcrypt.hash(employeeRecordData.employee_password, SALT_ROUNDS);
            employeeRecordData.employee_password = hashedPassword;
        } else {
            return res.status(400).json({
                message: 'Password is required and must be provided.',
            });
        }

        // Create the new employee record
        const newEmployeeRecord = new StaffAccount(employeeRecordData);
        await newEmployeeRecord.save();

        res.status(201).json({ message: 'Employee record added successfully', record: newEmployeeRecord });
    } catch (error) {
        // Specific error handling for Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));
            res.status(400).json({ message: 'Validation Error', errors: validationErrors });
        } else {
            res.status(500).json({ message: 'Error adding employee record', error: error.message });
        }
    }
}

const create_TemporaryRecord = async (req, res) => {
    const { email_address, processed_by_id, action, comments } = req.body;

    try {
        await connectToDB();
        const employeeRecordData = req.body;

        const duplicateChecks = await StaffAccount.findOne({
            $or: [
                { email_address: employeeRecordData.email_address },
            ],
        });

        if (duplicateChecks) {
            let duplicateField;

            if (duplicateChecks.email_address === employeeRecordData.email_address) {
                duplicateField = 'email_address';
            }

            return res.status(400).json({
                message: `This employee record account information with ${duplicateField} already exists.`,
            });
        }

        // Generate random plain password
        const plainPassword = generateRandomPassword();

        // Validate that password is strong
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        employeeRecordData.employee_password = hashedPassword;

        // Make sure to set created_by to the processed_by_id (or any field)
        employeeRecordData.created_by = processed_by_id;

        // Create the new employee record
        const newEmployeeRecord = new StaffAccount(employeeRecordData);
        await newEmployeeRecord.save();

        const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Account Registration</h2>
            <p>Hello, this is your account credentials to log in</p>
            <p>Email: <strong>${email_address}<strong></p>
            <p>Your temporary password is: <strong>${plainPassword}</strong></p>
            <p>This account does not have any expirations but we advise for you to change it as soon as possible.</p>
            <p>Thank you for choosing StaySuite Hotel Services.</p>
            <hr>
            <p style="font-size: 12px; color: #888;">This process / request was made by one of our staff members / managers</p>
        </div>
        `;

        // Issue a email sending.
        await Send(email_address, emailBody);

        // Log the action in the Audit Logs
        const ipAddress = requestIp.getClientIp(req);
        const deviceInfo = getDeviceInfo();

        const auditLogData = {
            issued_by: processed_by_id,
            action: action,
            comments: comments,
            ip_address: ipAddress,
            device_info: deviceInfo,
        };

        const newAuditLog = new AuditLogs(auditLogData);
        await newAuditLog.save();

        // **Upload Employee Image (Optional)**
        let uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            const folderName = "employee_records";

            const uploadPromises = req.files.map(file =>
                uploadFiles(file, folderName).then(uploadResult => ({
                    file_name: file.originalname,
                    file_url: uploadResult.Location,
                    uploaded_date: new Date(),
                }))
            );

            uploadedFiles = await Promise.all(uploadPromises);

            // Save media file record if files were uploaded
            if (uploadedFiles.length > 0) {
                const mediaFiles = new HotelMediaFiles({
                    processed_by_id: newEmployeeRecord._id,
                    for_by: for_by || null,
                    media_files: uploadedFiles,
                });
                await mediaFiles.save();
            }
        }

        res.status(201).json({
            message: "Employee record with audit record was added successfully",
            record: newEmployeeRecord,
            plainPassword: plainPassword,
            uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : "No files uploaded.",
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));
            res.status(400).json({ message: 'Validation Error', errors: validationErrors });
        } else {
            res.status(500).json({ message: 'Error adding employee record', error: error.message });
        }
    }
};

// PUT METHOD (NEEDS VALIDATION TOO)

const updateRecord = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;
        let updateData = req.body;

        // Check if the account exists
        const existingRecord = await StaffAccount.findOne({ employee_id: id });
        if (!existingRecord) {
            return res.status(404).json({ message: 'This employee record cannot be found' });
        }

        // Check for duplicate email or phone number
        const duplicateChecks = await StaffAccount.findOne({
            $or: [
                { email_address: updateData.email_address },
            ],
            employee_id: { $ne: id },
        });

        if (duplicateChecks) {
            let duplicateField;
            if (duplicateChecks.email_address === updateData.email_address) {
                duplicateField = 'email_address';
            }
            return res.status(400).json({
                message: `This employee record information with ${duplicateField} already exists.`,
            });
        }

        // Hash the password if it's being updated
        if (updateData.employee_password) {
            const hashedPassword = await bcrypt.hash(updateData.employee_password, SALT_ROUNDS);
            updateData.employee_password = hashedPassword;
        }

        // Update data
        const updatedRecord = await StaffAccount.findOneAndUpdate(
            { employee_id: id },
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'This Employee Record data was updated successfully', record: updatedRecord });

    } catch (error) {
        if (error.name === 'ValidationError') {
            // Handle Mongoose validation errors
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));
            res.status(400).json({ message: 'Validation Error', errors: validationErrors });
        } else {
            res.status(500).json({ message: 'Error updating employee record', error });
        }
    }
};

// HELPERS (THE REST)

function getDeviceInfo() {
    const info = platform;
    return {
        platform_name: info.name || 'Unidentified',
        platform_version: info.version || 'Unidentified',
        platform_product: info.product || 'Unidentified',
        platform_manufacturer: info.manufacturer || 'Unidentified',
        platform_layout: info.layout || 'Unidentified',
        platform_os: info.os.family || 'Unidentified',
        platform_description: info.description || 'Unidentified'
    };
}

module.exports = {
    getAllRecords, getRecordById, createRecord, updateRecord, create_TemporaryRecord
}