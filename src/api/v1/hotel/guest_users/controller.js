/*
*   This feature is for Overall Guest Accounts (only web)
*   src/api/v1/hotel/guest_accounts/controller.js
*/

const mongoose = require('mongoose');
const GuestUserAccount = require('./model');
const StaffAcount = require('../staff_accounts/model');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;
const { Send } = require('../../../../../global/config/NodeMailer');

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

// GET METHOD (BY ALL)

const getAllRecords = async (req, res) => {
    try {
        await connectToDB();
        const employee_records = await GuestUserAccount.find();
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
        const employeeRecord = await GuestUserAccount.findOne({ guest_id: id })
            .populate('created_by', '_id guest_id email_address employee_name username employee_role');

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
        const { email_address } = employeeRecordData;

        // 1. Check if email exists in StaffAccount
        const staffEmailExists = await StaffAcount.findOne({ email_address });
        if (staffEmailExists) {
            return res.status(400).json({
                message: `The email address '${email_address}' is already associated with a staff account.`,
            });
        }

        // 2. Check if email exists in GuestUserAccount
        const duplicateGuest = await GuestUserAccount.findOne({ email_address });
        if (duplicateGuest) {
            return res.status(400).json({
                message: `The email address '${email_address}' is already associated with a guest account.`,
            });
        }

        // 3. Validate password presence
        if (!employeeRecordData.guest_password) {
            return res.status(400).json({
                message: 'Password is required and must be provided.',
            });
        }

        // 4. Store plain password temporarily
        const plainPassword = employeeRecordData.guest_password;

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        employeeRecordData.guest_password = hashedPassword;

        // 6. Create and save the new GuestUserAccount
        const newEmployeeRecord = new GuestUserAccount(employeeRecordData);
        await newEmployeeRecord.save();

        // 7. Compose email
        const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2b2b2b;">🎉 Welcome to Our Hotel Management System</h2>
          <p>Hello <strong>${email_address}</strong>,</p>
          <p>We're thrilled to have you on board.</p>
          <p>Here's how to get started to book, check-in, and pay your reservation via PayPal:</p>
          <ol>
            <li>Log in with your account credentials provided below.</li>
            <li>Navigate to the booking section and choose your desired room.</li>
            <li>Complete the reservation and proceed with PayPal payment.</li>
          </ol>
          <p style="margin-top: 20px;">
            <a href="https://sbit-3o-hms.vercel.app" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
              Go to Portal
            </a>
          </p>
          <p style="margin-top: 20px;">Thank you for choosing our Hotel Management Services.</p>
          <hr>
          <p style="font-size: 12px; color: #888;">This inbox is a support on aftermath of your registration in our platform.</p>
        </div>
        `;

        // 8. Send welcome email
        await Send(email_address, emailBody);

        // 9. Respond with success
        res.status(201).json({
            message: 'Guest account created successfully',
            record: newEmployeeRecord,
            email_sent: true,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));
            return res.status(400).json({ message: 'Validation Error', errors: validationErrors });
        }

        res.status(500).json({ message: 'Error creating guest account', error: error.message });
    }
};

// PUT METHOD (NEEDS VALIDATION TOO)

const updateRecord = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;
        let updateData = req.body;

        // Check if the account exists
        const existingRecord = await GuestUserAccount.findOne({ guest_id: id });
        if (!existingRecord) {
            return res.status(404).json({ message: 'This employee record cannot be found' });
        }

        // Check for duplicate email or phone number
        const duplicateChecks = await GuestUserAccount.findOne({
            $or: [
                { email_address: updateData.email_address },
            ],
            guest_id: { $ne: id },
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
        if (updateData.guest_password) {
            const hashedPassword = await bcrypt.hash(updateData.guest_password, SALT_ROUNDS);
            updateData.guest_password = hashedPassword;
        }

        // Update data
        const updatedRecord = await GuestUserAccount.findOneAndUpdate(
            { guest_id: id },
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

module.exports = {
    getAllRecords, getRecordById, createRecord, updateRecord
}