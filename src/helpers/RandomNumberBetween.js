function RandomNumberBetween(min, max, canBeNegative) {
  let num = Math.floor(Math.random() * max) + min;
  if (canBeNegative) {
    // this will add minus sign in 50% of cases
    num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1; 
  }
  return num;
}

export default RandomNumberBetween;
