const getFromObject = (path, obj) => {
  return path.split(".").reduce(function (prev, curr) {
    return prev ? prev[curr] : undefined;
  }, obj || self);
};

function createObject(data, ...pathes) {
  return pathes.reduce(function (obj, path) {
    path.split(".").reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
    return obj;
  }, data);
}

module.exports = { getFromObject, createObject };
