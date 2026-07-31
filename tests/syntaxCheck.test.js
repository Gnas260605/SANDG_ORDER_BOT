/**
 * Integration & Syntax Verification Test
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

function getAllJsFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        getAllJsFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith(".js")) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

test("Syntax Verification - Đảm bảo tất cả các file JS nạp require không bị lỗi cú pháp", () => {
  const rootDir = path.join(__dirname, "..");
  const jsFiles = getAllJsFiles(rootDir);

  assert.ok(jsFiles.length > 10, "Số lượng file JS phải lớn hơn 10");

  jsFiles.forEach((filePath) => {
    try {
      require(filePath);
    } catch (err) {
      assert.fail(`Lỗi cú pháp hoặc nạp module tại file [${filePath}]: ${err.message}`);
    }
  });
});
