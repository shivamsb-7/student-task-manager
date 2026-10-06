const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "public");
const destination = path.join(__dirname, "..", "dist");

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });

console.log("Build completed: public/ copied to dist/");