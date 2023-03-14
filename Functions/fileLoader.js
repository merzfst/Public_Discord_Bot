const { glob } = require("glob");
const path = require("node:path");

async function deleteCachedFile(file) {
  const filePath = path.resolve(file);
  if (require.cache[filePath]) {
    delete require.cache[filePath];
  }
}

async function loadFiles(dirName) {
  try {
    const files = await glob(
      path.join(process.cwd(), dirName, "**/*.js").replace(/\\/g, "/") //чтение всех файлов с расширением js, исключая корневой каталог
    );
    const jsFiles = files.filter((file) => path.extname(file) === ".js");
    await Promise.all(jsFiles.map(deleteCachedFile));
    return jsFiles;
  } catch (error) {
    console.log(`Ошибка загрузки файлов из директории ${dirName}: ${error}`);
    throw error;
  }
}

module.exports = { loadFiles };
