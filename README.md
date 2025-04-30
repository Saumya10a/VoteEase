# VoteEase 🗳🔐

VoteEase is a secure, transparent, and user-friendly online voting system designed to modernize the electoral process. With a comprehensive set of features, it enables organizations to conduct fair and accessible elections while providing voters with a seamless experience. 🚀✨

## Features

🔒 *Secure Authentication*
- Separate login portals for voters and administrators
- Password-protected accounts for data security

🗳 *Election Management*
- Create and manage multiple elections simultaneously
- Set custom start and end dates for each election
- Add multiple candidates with details

👤 *Voter Management*
- Self-registration for voters
- Admin verification and management of voter accounts
- Voter profiles with essential information

📊 *Voting Process*
- Intuitive interface for casting votes
- One vote per voter per election enforcement
- Real-time validation of voting eligibility

📈 *Results & Analytics*
- Real-time vote counting and results display
- Graphical representation of election outcomes
- Detailed breakdown of voting statistics

🔐 *Security Features*
- Prevention of duplicate voting
- Secure data storage with MySQL
- Session management for authenticated users

🎛 *Admin Controls*
- Comprehensive dashboard for election oversight
- Voter database management
- Election creation and modification tools

## Tech Stack

🌐 *Frontend*
- HTML5, CSS3, and JavaScript for responsive UI
- Tailwind CSS for modern styling
- TypeScript for type-safe code

⚙ *Backend*
- Node.js with Express.js for server-side logic
- RESTful API architecture
- MySQL database for data persistence

🔧 *Development Tools*
- Vite for fast development and building
- ESLint for code quality
- TypeScript for type checking

🔄 *Authentication*
- Session-based authentication
- Secure password handling

## Instructions to Run Locally

### Requirements
- Node.js (v14 or higher)
- NPM (v6 or higher)
- MySQL Server
- Web browser (Chrome, Firefox, Edge recommended)

### Database Setup
1. Create a MySQL database named voteease
2. Configure the database connection in server/index.js:
   javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root', // Replace with your MySQL username
       password: 'YourPassword', // Replace with your MySQL password
       database: 'voteease'
   });
   

### Installation
1. Clone the repository to your local machine
2. Navigate to the project directory
3. Run npm install to install all dependencies
4. Create a MySQL database named voteease
5. Update the database connection details in server/index.js with your MySQL credentials
6. Start the backend server with npm run server (this runs node server/index.js)
7. In a separate terminal, start the frontend with npm run dev
8. Access the application at http://localhost:5173 (or the port shown in your terminal)

### Default Admin Credentials
- Username: admin
- Password: admin123

## Project Structure
- /pages - HTML files for different pages
- /styles - CSS stylesheets
- /scripts - JavaScript files for client-side functionality
- /server - Backend server code
- /src - TypeScript source files

## Features in Development
- 📱 Mobile responsiveness improvements
- 🔍 Advanced search and filtering for elections
- 📊 Enhanced analytics dashboard
- 🌐 Multi-language support
- 📱 Progressive Web App capabilities