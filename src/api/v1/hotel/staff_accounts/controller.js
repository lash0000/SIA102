/*
*   This feature is for Employees Information Management (HRIS)
*/

const mongoose = require('mongoose');
const StaffAccount = require('./model');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

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
        await connectToDB(); // Ensure DB connection
        const employee_records = await StaffAccount.find();
        res.status(200).json(employee_records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee record data', error });
    }
};

// GET METHOD (PER ID)

const getRecordById = async (req, res) => {
    try {
        await connectToDB(); // Ensure DB connection
        const { id } = req.params;
        const employeeRecord = await StaffAccount.findOne({ employee_id: id });

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

        const duplicateChecks = await StaffAccount.findOne({
            $or: [
                { employee_id: employeeRecordData.employee_id },
                { email_address: employeeRecordData.email_address },
                { phone_number: employeeRecordData.phone_number },
                { username: employeeRecordData.username },
            ],
        });

        if (duplicateChecks) {
            let duplicateField;

            if (duplicateChecks.employee_id === employeeRecordData.employee_id) {
                duplicateField = 'employee_id';
            } else if (duplicateChecks.email_address === employeeRecordData.email_address) {
                duplicateField = 'email_address';
            } else if (duplicateChecks.phone_number === employeeRecordData.phone_number) {
                duplicateField = 'phone_number';
            } else if (duplicateChecks.username === employeeRecordData.username) {
                duplicateField = 'username';
            }
            return res.status(400).json({
                message: `This employee record account information with ${duplicateField} already exists.`,
            });
        }

        // Hash the password before saving
        if (employeeRecordData.employee_password) {
            const hashedPassword = await bcrypt.hash(employeeRecordData.employee_password, SALT_ROUNDS);
            employeeRecordData.employee_password = hashedPassword;
        }

        const newEmployeeRecord = new StaffAccount(employeeRecordData);
        await newEmployeeRecord.save();

        res.status(201).json({ message: 'Added Employee Record successfully', record: newEmployeeRecord });
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Handle Mongoose validation errors
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

// PUT METHOD (NEEDS VALIDATION TOO)

const updateRecord = async (req, res) => {
    try {
        await connectToDB();
        const { id } = req.params;
        const updateData = req.body;

        // Check if the account exists
        const existingRecord = await StaffAccount.findOne({ employee_id: id });
        if (!existingRecord) {
            return res.status(404).json({ message: 'This employee record cannot found' });
        }

        // Check for duplicate brgy_email or brgy_phone_number
        const duplicateChecks = await StaffAccount.findOne({
            $or: [
                { email_address: updateData.email_address },
                { phone_number: updateData.phone_number },
            ],
            employee_id: { $ne: id },
        });

        if (duplicateChecks) {
            let duplicateField;
            if (duplicateChecks.email_address === updateData.email_address) {
                duplicateField = 'email_address';
            } else if (duplicateChecks.phone_number === updateData.phone_number) {
                duplicateField = 'phone_number';
            }
            return res.status(400).json({
                message: `This employee record information with ${duplicateField} already exists.`,
            });
        }

        // Update data
        const updatedRecord = await StaffAccount.findOneAndUpdate(
            { employee_id: id },
            updateData,
            { new: true, runValidators: true } // Return the updated document and run validations
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
            res.status(500).json({ message: 'Error updating barangay account information', error });
        }
    }
}

module.exports = {
    getAllRecords, getRecordById, createRecord, updateRecord
}