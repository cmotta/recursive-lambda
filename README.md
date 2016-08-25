# recursive-lambda

recursive-lambda is a wrapper around recursive code called within AWS Lambda. It solves the problem of running out of execution time.
Should a lambda hit the time limit, it will invoke new lambda so it could carry on with its business.

## Example
``` javascript
import Promise from 'bluebird';
import { SimpleStatefulRecursiveService } from '../src/SimpleStatefulRecursiveService';

class ExampleRecursiveService extends SimpleStatefulRecursiveService {

  constructor(params, lambdaClient, context) {
    super(params, lambdaClient, context);
    this.initState({executionCount: 0});
  }

  /*
  Specify logic that will be called recursively until termination logic is met.
  Ex: load DynamoDB records in batches, publish over SNS and repeat until done.
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
```

### Contributing
Contributions are always welcome!

### Credits
Developed by [microapps] (http://microapps.com/)

## License
recursive-lambda is available under the MIT license. See the LICENSE file for more info.
