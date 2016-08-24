import Promise from 'bluebird';
import { ExecutionState } from './ExecutionState';

class SimpleStatefulRecursiveService {

  constructor(params, lambdaClient, context) {
    this.executionState = ExecutionState.INITIAL;
    this.lambdaClient = lambdaClient;
    this.lambdaName = context.functionName;
    this.context = context;
    this._state = params || {};
  }

  get state() {
    return this._state;
  }

  _getExecutionState() {
    return this.executionState;
  }

  _isEnoughTimeLeft() {
    return (this.context.getRemainingTimeInMillis() > this.executionThreshold);
  }

  completeExecution() {
    this.executionState = ExecutionState.COMPLETE;
  }

  execute() {
    if (this._getExecutionState() === ExecutionState.INITIAL) {
      this.executionState = ExecutionState.IN_PROGRESS;
      return this._runAction();
    } else if (this._readyForNextRecursiveCall()) {
      return this._runAction();
    } else if (this._noTimeForNextRecursiveCall()) {
      return this._invokeLambda();
    } else if (this._isExecutionCompleted()) {
      return this.getFinalResult();
    }
    return Promise.resolve();
  }

  _readyForNextRecursiveCall() {
    return this.executionInvariant && this._getExecutionState() === ExecutionState.IN_PROGRESS && this._isEnoughTimeLeft();
  }

  _isExecutionCompleted() {
    return this._getExecutionState() === ExecutionState.COMPLETE;
  }

  _noTimeForNextRecursiveCall() {
    return !this.completeExecution() && this._getExecutionState() === ExecutionState.IN_PROGRESS && !this._isEnoughTimeLeft();
  }

  runAction() {
    return this.action(this.state)
    .catch(e => {
      this.errorCallback(e);
      return Promise.resolve();
    })
    .then(() => this.execute());
  }

  invokeLambda() {
    return new Promise((resolve, reject) => {
      const payload = this.state;
      const params = {
        FunctionName: this.lambdaName,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload)
      };
      this.lambdaClient.invoke(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  getFinalResult() {
    return this.state;
  }

  get executionThreshold() {
    return 60000;
  }

  /*
  This where your action goes
  Ex: listen to SQS and process messages as long as required
  Or load records from DynamoDB. params could contain reference to the next page
  Should return a promise
  */
  action(params = {}) {
    return Promise.resolve();
  }

  /*
  Updates service state.
  Ex: You loaded records from DynamoDB and there is a next page
  You store next page in this.state so further recursive calls could move on and load next page.
  Also if lambda runs out of time, next invoked lambda will have to know where to start.
  Otherwise, lambda will just load first page all over again.
  */
  updateState(state = {}, overwrite = false) {
    if (overwrite) {
      this._state = state;
    } else {
      Object.assign(this._state, state);
    }
    return this._state;
  }

  /*
  Specify condition that will make recursion go on as long it stays true
  Ex: Read records from DynamoDB => if there is no "this.state.lastEvaluatedKey",
  return results and stop recursion.
  However, if this.state.lastEvaluatedKey exists, recursion will continue
  Default implementation will execute action only once.
  */
  get executionInvariant() {
    return false;
  }

}

module.exports.SimpleStatefulRecursiveService = SimpleStatefulRecursiveService;
