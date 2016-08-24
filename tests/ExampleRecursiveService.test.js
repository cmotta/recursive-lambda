import * as chai from 'chai';
const expect = chai.expect;
import chaiAsPromised from 'chai-as-promised';
import chaiThings from 'chai-things';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import awsMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { ExampleRecursiveService } from '../examples/ExampleRecursiveService';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiThings);

describe('ExampleRecursiveService', () => {
  const lambdaContext = {
    functionName: 'lambda-function-name',
    getRemainingTimeInMillis: () => {}
  };
  let contextStub;
  let lambdaClient;
  let service;

  context('when there is enough time to go through all iterations', () => {
    before(() => {
      contextStub = sinon.stub(lambdaContext, 'getRemainingTimeInMillis').returns(300000);
      awsMock.mock('Lambda', 'invoke', 'ok');
      lambdaClient = new AWS.Lambda();
      service = new ExampleRecursiveService({}, lambdaClient, lambdaContext);
      sinon.spy(service, 'execute');
      sinon.spy(service, '_runAction');
      sinon.spy(service, 'action');
    });

    describe('#execute()', () => {
      it('executes recursive function 4 times', (done) => {
        service.execute().then((result) => {
          sinon.assert.callCount(service.execute, 5);
          sinon.assert.callCount(service._runAction, 4);
          sinon.assert.callCount(service.action, 4);
          expect(service.state).to.have.property('executionCount', 4);
          expect(service.state).to.have.property('result', 'accumulated dummy result');
          done();
        });
      });
    });

    after(() => {
      awsMock.restore('Lambda');
      contextStub.restore();
      service.execute.restore();
      service._runAction.restore();
      service.action.restore();
    });
  });
});
