import Promise from 'bluebird';
import { SimpleStatefulRecursiveService } from '../src/SimpleStatefulRecursiveService';

class ExampleRecursiveService extends SimpleStatefulRecursiveService {

  constructor(params, lambdaClient, context) {
    super(params, lambdaClient, context);
    this.initState({executionCount: 0});
  }

  /*
  Specify logic that will be called recursively until termination logic is met
  */
  action(params = {}) {
    return this.exampleEnigmaticRecursiveFunction(params);
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

  exampleEnigmaticRecursiveFunction(params = {}) {
    return new Promise((resolve, reject) => {
      const executionCount = this.state.executionCount + 1;
      this.updateState({executionCount, result: 'accumulated dummy result'});
      resolve();
    });
  }
}

module.exports.ExampleRecursiveService = ExampleRecursiveService;
