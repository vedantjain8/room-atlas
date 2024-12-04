# 📚 **API Routes Overview**

## **⚙️ Installation**

Follow these steps to set up the project on your local machine:

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/room-atlas.git
cd room-atlas/api
```

2. **Generate Private Key and Certificate**  
   Generate a self-signed SSL certificate for secure HTTPS connections and store it in `instance` folder:

```bash
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out private-key.pem
```

3. **Install Dependencies**

```bash
npm install
```

4. **Setup Environment Variables**  
   Copy the contents of the `example.env` file to a new `.env` file and fill in the required values.

5. **Run the Server**  
   Before running the server make sure that Postgres SQL and redis server is up and running

```bash
npm start
```

## Your server should now be running on `http://localhost:3100`. You can chnage the port in the `config/settings.js` file.

## **🔗 API Endpoints**

| **Route**           | **Description**                                                  |
| ------------------- | ---------------------------------------------------------------- |
| 🧑‍💻 `/user`          | Handles user-related operations like login, signup, and profile. |
| 🏠 `/listing`       | Manages property listings, including creation and updates.       |
| 👫 `/roommate`      | Facilitates roommate searches and matches.                       |
| ⭐ `/review`        | Enables user and listing reviews.                                |
| 💬 `/chat`          | WebSocket-based messaging for real-time user communication.      |
| ✅ `/verify`        | Handles email, phone, and document verification processes.       |
| 💡 `/feedback`      | Collects user feedback and suggestions.                          |
| 📅 `/calendar`      | Manages scheduling and availability for listings or bookings.    |
| 🛠️ `/const/listing` | Provides static data for listing types, amenities, and more.     |
| 🌟 `/review`        | Specialized listing reviews under `routes/listing/reviewRoutes`. |

---

## **🛡️ Authentication**

- **JWT Tokens** are implemented to ensure secure and stateless user authentication. 🔒
- Middleware verifies user tokens and permissions to protect sensitive routes. 🧩

---

## **💎 Code Highlights**

This codebase includes **some standout features** that elevate the overall experience:

### 1. **Dynamic Route Registration** ✨

- Routes are modular and cleanly structured for scalability.
- Each module (e.g., `userRoutes`, `listingRoutes`) is imported and mounted dynamically.

### 2. **WebSocket for Real-Time Chat** 💬

- Integrated WebSocket-based communication in `/chat` for instant messaging between users.

### 3. **Advanced Query Filtering** 🔍

- Implemented filtering, sorting, and pagination for `/listing` and `/roommate` routes using query parameters.

### 4. **Middleware for Authorization** 🛡️

- Middleware functions are used to verify user roles and permissions before accessing protected routes.

### 5. **Rate Limiting** 🚦

- Implemented rate limiting to protect API from abuse and ensure fair usage.

### 6. **Data Validation** ✅

- Used validation libraries to ensure incoming data is correct and secure.

### 7. **Logging** 📜

- Integrated logging to track API requests and errors for debugging and monitoring.

### 8. **Caching** ⚡

- To improve performance, caching is implemented for frequently accessed data.

### 9. **Database Migrations** 🔄

- Database migrations are used to manage schema changes and versioning.

### 10. **Job Scheduling** ⏰

- Scheduled jobs are run at frequent intervals to perform tasks like saving data from cache to database.

---

## **🛠️ Technologies Used**

- **Node.js** 🟩: Backend framework.
- **Express.js** 🚀: Simplified API development.
- **JSON Web Tokens (JWT)** 🔑: Authentication.
- **WebSocket** 📡: Real-time communication.
- **Postgres SQL** 🐘: Database for storing user and listing data.
- **Redis** 🔄: In-memory data store for caching.

---

## **🚧 Future Enhancements**

1. **🔒 Advanced Authentication**

   - Implement **OAuth 2.0** for third-party login integrations (e.g., Google, Facebook).
   - Add multi-factor authentication (MFA) for enhanced user security.

2. **📊 Analytics and Insights**

   - Build an **admin dashboard** to monitor user activity, listing performance, and system metrics.
   - Add **real-time analytics** to track and display live user interactions.

3. **🌐 Internationalization (i18n)**

   - Support multiple languages to cater to a broader audience.
   - Include currency and measurement unit conversion based on user location.

4. **💡 AI-Powered Recommendations**

   - Use machine learning to suggest suitable roommates or listings based on user preferences.
   - Build a recommendation engine to show listings based on search and interaction history.

5. **📱 Mobile App Support**

   - Develop a **React Native** or **Flutter**-based mobile app for on-the-go accessibility.
   - Implement native push notifications for mobile users.

6. **🛡️ Enhanced Security Features**

   - Incorporate automated vulnerability scans and regular penetration testing.

7. **🌐 API Monetization**

   - Introduce subscription plans for premium users, such as advanced filtering or priority listing.
   - Provide a public API for external developers to integrate with your system.

8. **🚀 Deployment Enhancements**

   - Implement containerization with **Docker** for consistent and scalable deployments.
   - Set up CI/CD pipelines with tools like **GitHub Actions** for automated testing and deployment.

9. **💬 AI Chatbot for Support**

   - Develop an AI-driven chatbot to assist users with common queries, such as finding listings or troubleshooting issues.

10. **🔍 Improved Search and Filters**
    - Enable **geolocation-based search** to find nearby listings.
    - Add advanced filters like "pet-friendly" or "zero deposit."

---

## **Contributions** 🤝

Feel free to create pull requests or issues to suggest improvements! Let's build this project together! 🎉

---

**✨ Thank you for exploring the API Routes! Happy coding! 🖥️✨**
