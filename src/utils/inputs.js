function getInitState(sources) {
  const networksInitState = {};
  for (let i = 0; i < sources.length; i += 1) {
    networksInitState[sources[i]] = {
      cost: 0,
      clicks: 0,
    };
  }
  return networksInitState;
}

function getFlatInputs(inputData, networksInitState) {
  const flatInput = {};
  for (let i = 0; i < inputData.length; i += 1) {
    flatInput[inputData[i]._id.page] = { ...networksInitState };
    for (let x = 0; x < inputData[i].sources.length; x += 1) {
      flatInput[inputData[i]._id.page][inputData[i].sources[x]] = {
        cost: inputData[i].cost[x],
        clicks: inputData[i].clicks[x],
      };
    }
  }
  return flatInput;
}

function mergeInputs(flatInput, networksInitState, pageID) {
  return flatInput[pageID]
    ? { ...networksInitState, ...flatInput[pageID] }
    : networksInitState;
}

export { getInitState, getFlatInputs, mergeInputs };
