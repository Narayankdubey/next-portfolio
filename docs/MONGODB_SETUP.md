# MongoDB Integration Setup Guide

This guide explains how to set up MongoDB for storing contact form submissions in both local development and production environments.

## 📋 Overview

The contact form now saves submissions to MongoDB with the following features:

- ✅ Form validation
- ✅ Database persistence
- ✅ Error handling
- ✅ Success/error notifications
- ✅ Loading states

## 🏠 Local Development Setup

### Prerequisites

- MongoDB installed locally on your machine

### Installation

1. **Install MongoDB** (if not already installed)
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow [official installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service**

   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # OR
   mongod

   # Windows
   net start MongoDB
   ```

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # You should see MongoDB shell prompt
   ```

### Environment Configuration

1. **Create `.env.local` file** (already created):

   ```bash
   MONGODB_URI=mongodb://localhost:27017/portfolio
   ```

2. **Test the connection**:
   - Run your Next.js app: `yarn dev`
   - Submit the contact form
   - Check MongoDB:
     ```bash
     mongosh
     use portfolio
     db.contacts.find()
     ```

## ☁️ Production Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is sufficient)

### Step 2: Configure Database Access

1. **Create Database User**:
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Choose authentication method (Username/Password recommended)
   - Create username and strong password
   - Grant "Read and write to any database" role
   - Save the credentials securely

2. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow access from anywhere)
     - Note: For better security, use specific IP ranges of your hosting provider

### Step 3: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 4: Update Environment Variables

1. **For Vercel/Netlify/Other Hosting**:
   - Go to your project settings
   - Find "Environment Variables"
   - Add new variable:
     - Name: `MONGODB_URI`
     - Value: Your Atlas connection string (replace `<username>` and `<password>`)

   Example:

   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

2. **Important**: Replace placeholders in the connection string:
   - `<username>`: Your database username
   - `<password>`: Your database password
   - Add database name after `.net/`: `/portfolio`

### Step 5: Deploy

1. Redeploy your application
2. Test the contact form in production
3. Verify data in Atlas:
   - Go to "Collections" in Atlas
   - Select your database (`portfolio`)
   - View the `contacts` collection

## 📊 Database Schema

### Contact Model

```typescript
{
  name: String,        // Required, max 100 characters
  email: String,       // Required, valid email format
  message: String,     // Required, max 1000 characters
  createdAt: Date,     // Auto-generated timestamp
  updatedAt: Date      // Auto-generated timestamp
}
```

## 🔌 API Endpoints

### POST `/api/contact`

Submit a new contact form entry.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to connect!"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Contact form submitted successfully!",
  "data": {
    "id": "65abc123...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "All fields are required"
}
```

### GET `/api/contact`

Retrieve all contact submissions (for admin use).

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello!",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🧪 Testing

### Test Locally

1. Start MongoDB: `mongod`
2. Run dev server: `yarn dev`
3. Go to contact section
4. Fill and submit the form
5. Check console for "✅ Connected to MongoDB"
6. Verify in database:
   ```bash
   mongosh
   use portfolio
   db.contacts.find().pretty()
   ```

### Test in Production

1. Deploy to your hosting platform
2. Set `MONGODB_URI` environment variable
3. Submit a test contact form
4. Check MongoDB Atlas Collections

## 🛠️ Troubleshooting

### "Failed to connect to MongoDB"

- **Local**: Ensure MongoDB service is running
- **Production**: Check connection string format and credentials

### "MONGODB_URI not defined"

- Ensure `.env.local` exists locally
- Ensure environment variable is set in production

### "Validation Error"

- Check that all required fields are filled
- Verify email format is valid
- Ensure message is under 1000 characters

### Connection timeout

- **Local**: Try `mongodb://127.0.0.1:27017/portfolio`
- **Atlas**: Check network access settings (whitelist IP)

## 🔒 Security Best Practices

1. **Never commit `.env.local`** (already in .gitignore)
2. **Use strong passwords** for Atlas users
3. **Limit IP access** in production when possible
4. **Rotate credentials** periodically
5. **Monitor access logs** in Atlas

## 📁 File Structure

```
src/
├── app/
│   └── api/
│       └── contact/
│           └── route.ts          # API endpoint
├── components/
│   └── Contact.tsx               # Form component
├── lib/
│   └── mongodb.ts                # DB connection utility
└── models/
    └── Contact.ts                # Mongoose schema
```

## 🚀 Next Steps

- [ ] Set up email notifications for new submissions
- [ ] Create admin panel to view submissions
- [ ] Add spam protection (reCAPTCHA)
- [ ] Implement rate limiting
- [ ] Add analytics tracking

---

**Need help?** Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) or [Mongoose Documentation](https://mongoosejs.com/docs/guide.html).
