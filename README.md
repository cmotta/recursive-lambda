# recursive-lambda
[![Version npm](https://img.shields.io/npm/v/recursive-lambda.svg)](https://www.npmjs.com/package/recursive-lambda/)
[![GitHub stars](https://img.shields.io/github/stars/microapps/recursive-lambda.svg?style=flat-square)](https://github.com/microapps/recursive-lambda/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/microapps/recursive-lambda/master/LICENSE)

recursive-lambda is a wrapper around recursive code called within AWS Lambda. It solves the problem of running out of execution time.
Should a lambda hit the time limit, it will invoke new lambda so it could carry on with its business.

## Example
``` javascript
import Promise from 'bluebird';
import { SimpleStatefulRecursiveService } from 'recursive-lambda';

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

Developed by [microapps] (http://microapps.com/?utm_source=recursive-lambda-repo-readme&utm_medium=click&utm_campaign=github)
Used in our live products: [MoonMail] (https://moonmail.io/?utm_source=recursive-lambda-repo-readme&utm_medium=click&utm_campaign=github) & [MONEI] (https://monei.net/?utm_source=recursive-lambda-repo-readme&utm_medium=click&utm_campaign=github)

## License
recursive-lambda is available under the MIT license. See the LICENSE file for more info.
