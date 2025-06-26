#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Validating npm package structure...\n");

// Check if dist directory exists
if (!fs.existsSync("dist")) {
  console.error("❌ dist/ directory not found. Run npm run build first.");
  process.exit(1);
}

// Check main entry point
const packageJson = require("../package.json");
const mainEntry = packageJson.main;
if (!fs.existsSync(mainEntry)) {
  console.error(`❌ Main entry point not found: ${mainEntry}`);
  process.exit(1);
}

// Check types entry point
const typesEntry = packageJson.types;
if (!fs.existsSync(typesEntry)) {
  console.error(`❌ Types entry point not found: ${typesEntry}`);
  process.exit(1);
}

// Check binary
const binEntry = packageJson.bin.replyt;
if (!fs.existsSync(binEntry)) {
  console.error(`❌ Binary not found: ${binEntry}`);
  process.exit(1);
}

// Check if binary is executable
try {
  fs.accessSync(binEntry, fs.constants.F_OK | fs.constants.X_OK);
  console.log("✅ Binary is executable");
} catch (err) {
  console.error(`❌ Binary is not executable: ${binEntry}`);
  process.exit(1);
}

// Check essential files
const essentialFiles = ["README.md", "LICENSE", "package.json"];

for (const file of essentialFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Essential file not found: ${file}`);
    process.exit(1);
  }
}

// Check scripts directory
if (!fs.existsSync("scripts")) {
  console.error("❌ scripts/ directory not found");
  process.exit(1);
}

// Check examples directory
if (!fs.existsSync("examples")) {
  console.error("❌ examples/ directory not found");
  process.exit(1);
}

// Check package.json required fields
const requiredFields = [
  "name",
  "version",
  "description",
  "main",
  "types",
  "bin",
  "keywords",
  "author",
  "license",
  "repository",
];

for (const field of requiredFields) {
  if (!packageJson[field]) {
    console.error(`❌ Missing required package.json field: ${field}`);
    process.exit(1);
  }
}

console.log("✅ Main entry point exists:", mainEntry);
console.log("✅ Types entry point exists:", typesEntry);
console.log("✅ Binary exists:", binEntry);
console.log("✅ All essential files present");
console.log("✅ All required package.json fields present");

// Test require/import
try {
  const lib = require(path.resolve(mainEntry));
  if (lib.Replyt && lib.AutoReplyBot && lib.config) {
    console.log("✅ Main exports are accessible");
  } else {
    console.error("❌ Main exports are missing or incorrect");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error requiring main module:", error.message);
  process.exit(1);
}

console.log("\n🎉 Package validation successful!");
console.log("📦 Ready for publishing with: npm publish");
console.log("🚀 Or test locally with: npm pack");

// Show package size estimate
try {
  const { execSync } = require("child_process");
  const packOutput = execSync(
    'npm pack --dry-run 2>/dev/null || echo "Could not estimate size"',
    { encoding: "utf8" }
  );
  console.log("\n📊 Package content preview:");
  console.log(packOutput);
} catch (error) {
  console.log("\n📊 Could not preview package contents");
}
