const MudParser = (schema, data) => {
  let hierarchy = ResultHierarchy(schema, data);
  let result = [];
  Object.keys(hierarchy).map((h) => result.push(hierarchy[h]));

  result.map((r) => fixMudParser(r));

  return result;
};

const Iterator = (arr) => {
  let isLastArr = 0;
  let isFirstArr = 0;
  const m = /\.\d+/g.exec(arr[arr.length - 1]);
  if (m !== null) {
    isLastArr = 1;
    arr[arr.length - 1] = arr[arr.length - 1].substring(0, m.index);
  }
  const n = /\d+\./g.exec(arr[0]);
  if (n !== null) {
    isFirstArr = 1;
    arr[0] = arr[0].substring(n.index + n[0].length);
  }

  let internalCounter = 0;
  let itCounter = Array.from(
    { length: arr.length - 1 + isLastArr + isFirstArr },
    (_, i) => 0
  );
  let itIndex = itCounter.length - 1;
  let skipCalled = -1;
  let skipCounter = 1;
  let done = false;

  const funcs = {
    key: () => {
      let string = "";
      let counter = 0;
      arr.map((ar, arIndex) => {
        if (arIndex === 0 && isFirstArr === 1) {
          if (arr.length === 1) string += `${itCounter[counter]}.${ar}`;
          else
            string += `${itCounter[counter]}.${ar}.${itCounter[counter + 1]}.`;
          counter += 2;
          return;
        }
        if (arIndex === arr.length - 1) {
          if (isLastArr === 1) string += `${ar}.${itCounter[counter]}`;
          else string += `${ar}`;
          return;
        }
        string += `${ar}.${itCounter[counter]}.`;
        counter++;
      });

      return string;
    },
    next: function () {
      internalCounter++;
      skipCalled--;
      let result;
      result = funcs.key();
      itCounter[itIndex]++;
      if (done) return "done";
      else return result;
    },
    skip: () => {
      if (internalCounter - 2 === skipCalled) {
        itIndex = itIndex - skipCounter;
        skipCounter++;
      } else {
        skipCounter = 1;
      }
      if (itIndex - 1 < 0) done = true;

      itCounter[itIndex - 1]++;

      for (let i = 0; i < itCounter.length; i++) {
        if (i > itIndex - 1) {
          itCounter[i] = 0;
        }
      }

      itIndex = itCounter.length - 1;
      skipCalled = internalCounter;
    },
  };
  return funcs;
};

const resolve = (path, obj) => {
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

const getIndexes = (str) => {
  const re = /\.\d+\./g;
  let whileStop = 0;
  let indexes = [];
  let match;
  while ((match = re.exec(str)) != null) {
    whileStop++;
    if (whileStop >= 15) break;

    indexes.push(match.index);
  }
  return indexes;
};

const getNonArrays = (str) => {
  const indexes = getIndexes(str);
  let res = [];
  let counter = 0;
  indexes.map((index) => {
    res.push(str.substring(counter, index));
    counter = index + 3;
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
    let res = resolve(searchString, data);
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
  let f = /\d+\./g.exec(str);
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
    schemaRes.map((sch) => {
      let objStringArr = [];
      let indexes = getLastIndexes(sch.path);
      let initIndex = 0;
      indexes.map((index) => {
        let keyString = sch.path.substring(initIndex, index);
        keyString = keyString.replaceAll(".", "");
        keyString += "__";
        objStringArr.push(keyString);
        initIndex = index;
      });
      createObject(result, objStringArr.join("."));
      let lastObj = resolve(objStringArr.join("."), result);
      lastObj[sch.key] = sch.value;
    });
  });
  return result;
};

const fixMudParser = (object) => {
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
      fixMudParser(object[key]);
    }
  }
};

module.exports = { MudParser };
