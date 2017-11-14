import { isStateTreeNode } from 'mobx-state-tree';

function modelOf(type) {
  return (props, propName, componentName) => {
    if (!isStateTreeNode(props[propName]) || !type.is(props[propName])) {
      return new Error(`Invalid value for prop ${propName}`);
    }
  };
}

export { modelOf };
