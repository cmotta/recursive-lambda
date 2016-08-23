# recursive-lambda

recursive-lambda is a wrapper around recursive code called within AWS Lambda. It solves the problem of running out of execution time.
Should a lambda hit the time limit, it will invoke new lambda so it could carry on with its business.

## Example story
Imagine you have data in DynamoDB, and you want to create a report from it. You might not get and process all records on time, because lambda has time limits.
In addition to time limits, there are DynamoDB limits too. So a solution is to use recursion. Process data recursively until job is done.
In your code you would need to handle recursive calls as well watch out for remaining time.
A wrapper class in recursive-lambda will keep track of time and invoke next lambda for you. You are required to provide pure logic by extending the class and overwriting *action*, *processResult* and additional methods if required. With this wrapper, you are free from housekeeping code.

### Contributing
Contributions are always welcome!

### Credits
Developed by [microapps] (http://microapps.com/)

## License
recursive-lambda is available under the MIT license. See the LICENSE file for more info.

## TODO
validate against real world code
write tests
write examples
