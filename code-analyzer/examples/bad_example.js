// Bad JavaScript Example

var globalVar = "bad practice";

function fetchData(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched data:", data);
      let result = data;
      if (result == true) {
        console.log("Result is true");
        if (result.nested) {
          if (result.nested.deep) {
            if (result.nested.deep.value) {
              console.log(result.nested.deep.value);
            }
          }
        }
      }
    });
}

async function processAsync() {
  const data = await fetchData("http://api.example.com");
  return data;
}

function veryLongFunction() {
  let x = 1;
  let y = 2;
  let z = 3;
  let a = 4;
  let b = 5;
  let c = 6;
  let d = 7;
  let e = 8;
  let f = 9;
  let g = 10;
  let h = 11;
  let i = 12;
  let j = 13;
  let k = 14;
  let l = 15;
  let m = 16;
  let n = 17;
  let o = 18;
  let p = 19;
  let q = 20;
  console.log(x + y + z + a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q);
}

const unused = "never used";

module.exports = {
  fetchData,
  processAsync,
  veryLongFunction
};
