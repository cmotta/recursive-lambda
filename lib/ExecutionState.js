'use strict';

var executionState = {
  INITIAL: 'INITIAL',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
  ABORTED: 'ABORTED'
};

module.exports.ExecutionState = executionState;