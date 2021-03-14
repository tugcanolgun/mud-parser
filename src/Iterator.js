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

module.exports = Iterator;
