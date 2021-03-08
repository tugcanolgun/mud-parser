const Iterator = require("./Iterator");
const { getFromObject, createObject } = require("./ObjectUtils");

let replace = {};

const MudParser = (schema, data) => {
  if (data === undefined) return null;
  checkSchema(schema);
  replace = {};
  let hierarchy = ResultHierarchy(schema.parsers, data);
  let result = [];
  Object.keys(hierarchy).map((h) => result.push(hierarchy[h]));

  result.map((r) => cleanResults(r));

  return result;
};

const checkSchema = (schema) => {
  if (
    !(typeof schema === "object" && schema !== null) ||
    schema.constructor === Array
  )
    throw "MudParser schema has to be an object.";

  if (!schema.hasOwnProperty("version"))
    throw "MudParser requires version to be defined.";

  if (!schema.hasOwnProperty("parsers"))
    throw "MudParser requires parsers in the schema object.";

  if (schema.parsers.constructor !== Array)
    throw "MudParser: parsers needs to be an array.";

  if (schema.parsers.length === 0) throw "MudParser: parsers array is empty.";

  schema.parsers.map((parser) => {
    if (
      !(typeof parser === "object" && parser !== null) ||
      parser.constructor === Array
    )
      throw "MudParser: parser elements have to be objects.";
    if (!parser.hasOwnProperty("key"))
      throw "MudParser: parser elements have to have key property.";
    if (!parser.hasOwnProperty("value"))
      throw "MudParser: parser elements have to have value property.";
  });
};

const getIndexes = (str) => {
  const re = /\.\d+\./g;
  let whileStop = 0;
  let indexes = [];
  let match;
  while ((match = re.exec(str)) != null) {
    whileStop++;
    if (whileStop >= 15) break;

    indexes.push(match);
  }
  return indexes;
};

const saveReplace = (key, replaceValue, index) => {
  replace[key] = { replace: replaceValue, index };
};

const getReplace = (str, index) => {
  for (let keyName in replace) {
    if (str.includes(keyName) && index === replace[keyName].index) {
      return str.replace(keyName, replace[keyName].replace);
    }
  }

  return str;
};

const checkAndGetReplace = (str, index) => {
  const re = /\|/;
  let match = re.exec(str);
  if (match !== null) {
    let main = str.substring(0, match.index);
    let replace = str.substring(match.index + 1);
    saveReplace(main, replace, index);
    return main;
  }
  return str;
};

const getNonArrays = (str) => {
  const indexes = getIndexes(str);
  let res = [];
  let counter = 0;
  indexes.map((match, index) => {
    let path = str.substring(counter, match.index);
    res.push(checkAndGetReplace(path, index));
    counter = match.index + match[0].length;
  });
  let last = str.substring(counter);
  if (last !== "") res.push(last);

  return res;
};

const getSchema = (schema, data) => {
  let result = [];
  const arr = getNonArrays(schema.value);
  const it = Iterator(arr);
  for (let i = 0; i < 100; i++) {
    let searchString = it.next();
    if (searchString === "done") break;
    let res = getFromObject(searchString, data);
    if (res === undefined) {
      it.skip();
      continue;
    }
    result.push({
      path: searchString,
      key: schema.key,
      value: res,
    });
  }
  return result;
};

const getLastIndexes = (str) => {
  const re = /\.\d+\./g;
  let whileStop = 0;
  let indexes = [];
  let f = /^\d+\./g.exec(str);
  if (f !== null) indexes.push(f[0].length);
  let match;
  while ((match = re.exec(str)) != null) {
    whileStop++;
    if (whileStop >= 15) break;
    indexes.push(match.index + match[0].length - 1);
  }
  let temp = str;
  if (indexes.length > 0) {
    let temp = str.substring(indexes[indexes.length - 1]);
  }
  let m = /\.\d+/g.exec(temp);
  if (
    m != null &&
    indexes.find((i) => i === m.index + m[0].length) === undefined
  )
    indexes.push(m.index + m[0].length);

  return indexes;
};

const ResultHierarchy = (schema, data) => {
  let result = {};
  let _ = schema.map((sch) => {
    const schemaRes = getSchema(sch, data);
    schemaRes.map((schR) => {
      let objStringArrReplaced = [];
      let indexes = getLastIndexes(schR.path);
      let initIndex = 0;
      indexes.map((index, ii) => {
        let keyString = schR.path.substring(initIndex, index);
        keyString = keyString.replaceAll(".", "");
        keyString += "__";
        objStringArrReplaced.push(getReplace(keyString, ii));
        initIndex = index;
      });
      createObject(result, objStringArrReplaced.join("."));
      let lastObj = getFromObject(objStringArrReplaced.join("."), result);
      lastObj[schR.key] = schR.value;
    });
  });
  return result;
};

const cleanResults = (object) => {
  for (var key in object) {
    if (!object.hasOwnProperty(key)) continue;

    const check = /\d+__/g.exec(key);
    if (check !== null) {
      const mudKey = key.substring(0, check.index);
      if (mudKey in object) {
        object[mudKey].push(object[key]);
      } else {
        object[mudKey] = [object[key]];
      }
      delete object[key];
    }

    if (typeof object[key] == "object") {
      cleanResults(object[key]);
    }
  }
};

module.exports = MudParser;
