const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require('serverless-http');
const routes = require('./src/helpers/routes');

dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: '500mb' })); 
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Enable CORS globally
app.use(cors());

// API Routes
app.use('/api/v1/hotel', routes);

// Home route
app.get('/', (req, res) => {
    res.json({
        project_name: "Welcome to SIA102 - Generalize Hotel Management backend services",
        project_overview: "This empowers AWS MongoDB we will use AWS S3, AWS SNS or AWS SQS if applicable sooner.",
        project_type: "Proprietary based because someday we will control you!",
        facts: "It's a joke anyway!",
        source_code: "https://github.com/lash0000/SIA102",
        version: "1.0.0",
        api_base_url: "/api/v1/hotel/{route}",
        description: "This API handles staff accounts and various hotel management use-cases.",
        available_routes: [
            "/api/v1/hotel/staff_accounts",
            "/api/v1/hotel/staff_accounts/{id}",
            "/api/v1/hotel/otp/forgot-password",
            "/api/v1/hotel/otp/otp-registration"
        ]
    });
});

// Export handler for Serverless
module.exports.handler = serverless(app);

// Start local server if running outside AWS Lambda
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}