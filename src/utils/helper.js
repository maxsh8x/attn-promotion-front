const shallowCompare = (ArrA, ArrB) =>
  ArrA.every((value, index) => value === ArrB[index]);

export default shallowCompare;
