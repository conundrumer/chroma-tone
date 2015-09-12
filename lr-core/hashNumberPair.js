'use strict';

// http://stackoverflow.com/a/13871379
export function hashUIntPair(a, b) {
  return (a >= b) ? (a * a + a + b) : (b * b + a);
}

export function unhashUIntPair(n) {
  let x = Math.sqrt(n) | 0; // x = a < b ? b : a
  let r = n - x * x; //        r = a < b ? a : a+b
  if (r < x) { // r = a, x = b, a < b
    return [r, x];
  } else { // r = a+b, x = a
    return [x, r - x];
  }
}

export function hashIntPair(a, b) {
  let A = a >= 0 ? 2 * a : -2 * a - 1;
  let B = b >= 0 ? 2 * b : -2 * b - 1;
  let C = (A >= B) ? (A * A + A + B) : (B * B + A);
  return (C & 1) ? -(C - 1) / 2 - 1 : C / 2;
}

export function unhashIntPair(n) {
  let C = n >= 0 ? n * 2 : (-(n + 1) * 2 + 1);
  let [A, B] = unhashUIntPair(C);
  let a = (A & 1) ? -(A + 1) / 2 : A / 2;
  let b = (B & 1) ? -(B + 1) / 2 : B / 2;
  return [a, b];
}

// import assert from 'assert';
// let n;
// for (let i = 0; i < 10; i++) {
//   for (let j = 0; j < 10; j++) {
//     n = hashIntPair(i, j);
//     let [i_, j_] = unhashIntPair(n);
//     assert.equal(i, i_);
//     assert.equal(j, j_);
//     if (i !== 0) {
//       n = hashIntPair(-i, j);
//       let [i_, j_] = unhashIntPair(n);
//       assert.equal(-i, i_);
//       assert.equal(j, j_);
//     }
//     if (j !== 0) {
//       n = hashIntPair(i, -j);
//       let [i_, j_] = unhashIntPair(n);
//       assert.equal(i, i_);
//       assert.equal(-j, j_);
//     }
//     if (i !== 0 && j !== 0) {
//       n = hashIntPair(-i, -j);
//       let [i_, j_] = unhashIntPair(n);
//       assert.equal(-i, i_);
//       assert.equal(-j, j_);
//     }
//   }
//   assert.equal(i, hashIntPair(...unhashIntPair(i)))
//   assert.equal(-i, hashIntPair(...unhashIntPair(-i)))
// }
// console.log('passed')
// assert(false)
