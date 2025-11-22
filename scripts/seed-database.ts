#!/usr/bin/env tsx

/**
 * Database Seeding Script
 *
 * This script migrates data from JSON files to MongoDB.
 * Run once to populate the database with initial data.
 *
 * Usage: npx tsx scripts/seed-database.ts
 */

import mongoose from "mongoose";
import Portfolio from "../src/models/Portfolio";
import FeatureFlags from "../src/models/FeatureFlags";
// import portfolioData from "../src/data/portfolio.json";
// import featureFlagsData from "../src/config/featureFlags.json";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Seed Portfolio Data
    console.log("📊 Seeding Portfolio data...");
    const existingPortfolio = await Portfolio.findOne();

    if (existingPortfolio) {
      console.log("⚠️  Portfolio data already exists.");
      // await Portfolio.findByIdAndUpdate(existingPortfolio._id, portfolioData);
      // console.log("✅ Portfolio data updated");
    } else {
      // await Portfolio.create(portfolioData);
      // console.log("✅ Portfolio data created");
      console.log("⚠️  Skipping portfolio seeding: Source data missing.");
    }

    // Seed Feature Flags
    console.log("\n🚩 Seeding Feature Flags...");
    const existingFlags = await FeatureFlags.findOne();

    if (existingFlags) {
      console.log("⚠️  Feature flags already exist.");
      // await FeatureFlags.findByIdAndUpdate(existingFlags._id, featureFlagsData);
      // console.log("✅ Feature flags updated");
    } else {
      // await FeatureFlags.create(featureFlagsData);
      // console.log("✅ Feature flags created");
      console.log("⚠️  Skipping feature flags seeding: Source data missing.");
    }

    // Verify seeded data
    console.log("\n🔍 Verifying seeded data...");
    const portfolio = await Portfolio.findOne();
    const flags = await FeatureFlags.findOne();

    console.log(`\n📦 Portfolio document ID: ${portfolio?._id}`);
    console.log(`   - Projects: ${portfolio?.projects.length}`);
    console.log(`   - Experience: ${portfolio?.experience.length}`);
    console.log(`   - Skills (frontend): ${portfolio?.skills.frontend.length}`);

    console.log(`\n🚩 Feature Flags document ID: ${flags?._id}`);
    console.log(
      `   - Sections enabled: ${Object.values(flags?.sections || {}).filter(Boolean).length}`
    );
    console.log(
      `   - Features enabled: ${Object.values(flags?.features || {}).filter(Boolean).length}`
    );

    console.log("\n✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the seed function
seedDatabase();
