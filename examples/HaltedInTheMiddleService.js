import Promise from 'bluebird';
import { SimpleStatefulRecursiveService } from '../src/SimpleStatefulRecursiveService';

class HaltedInTheMiddleService extends SimpleStatefulRecursiveService {

  constructor(params, lambdaClient, context) {
    super(params, lambdaClient, context);
    this.initState({executionCount: 0});
  }

  /*
  Specify logic that will be called recursively until termination logic is met.
  Ex: load DynamoDB records in batches, publish over SNS and repeat until done.
  */
  action(params = {}) {
    return this.exampleOfHaltedEnigmaticRecursiveFunction(params);
  }

  /*
  Specify when you want recursion to stop.
  If you don't overwrite parent implementation,
  your recursive function will be called exactly once
  */
  get executionInvariant() {
    return this.state.executionCount < 4;
  }

  /*
  Specify execution threshold in milliseconds
  */
  get executionThreshold() {
    return 200000;
  }

  exampleOfHaltedEnigmaticRecursiveFunction(params = {}) {
    return new Promise((resolve, reject) => {
      const executionCount = this.state.executionCount + 1;
      this.updateState({executionCount, result: 'accumulated dummy result'});
      if (executionCount === 3) {
        /* this is when you realize that it is pointless to continue
        and it is time to halt recursion
        even though recursion invariant stays true to its values
        and is willing to continue to carry out its mission
        no matter what
        */
        this.completeExecution();
      }
      resolve();
    });
  }
}

module.exports.HaltedInTheMiddleService = HaltedInTheMiddleService;
