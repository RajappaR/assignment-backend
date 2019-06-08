const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const currentDir = join(__dirname);

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);

module.exports = (router) => {
  const allDirs = getDirectories(currentDir);

  allDirs.forEach(function(dir) {
    const routeFile = readdirSync(dir).filter(file => file === "routes.js")[0];
    require(join(dir, routeFile))(router);
  });

  return router;
};
