import * as chai from 'chai';
const expect = chai.expect;
import chaiAsPromised from 'chai-as-promised';
import chaiThings from 'chai-things';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import awsMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { HaltedInTheMiddleService } from '../examples/HaltedInTheMiddleService';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiThings);

describe('HaltedInTheMiddleService', () => {
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
      service = new HaltedInTheMiddleService({}, lambdaClient, lambdaContext);
      sinon.spy(service, 'execute');
      sinon.spy(service, '_runAction');
      sinon.spy(service, 'action');
    });

    describe('#execute()', () => {
      it('executes recursive function 3 times and gets explicitly halted', (done) => {
        service.execute().then(() => {
          sinon.assert.callCount(service.execute, 4);
          sinon.assert.callCount(service._runAction, 3);
          sinon.assert.callCount(service.action, 3);
          expect(service.state).to.have.property('executionCount', 3);
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
