import * as chai from 'chai';
const expect = chai.expect;
import chaiAsPromised from 'chai-as-promised';
import chaiThings from 'chai-things';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import awsMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { SimpleStatefulRecursiveService } from '../src/SimpleStatefulRecursiveService';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiThings);

describe.skip('SimpleStatefulRecursiveService', () => {
  const lambdaContext = {
    functionName: 'lambda-function-name',
    getRemainingTimeInMillis: () => {}
  };
  let contextStub;
  let lambdaClient;
  let service;

  context('when there is enough time to go through all iterations', () => {
    before(() => {
      contextStub = sinon.stub(lambdaContext, 'getRemainingTimeInMillis').returns(100000);
      awsMock.mock('Lambda', 'invoke', 'ok');
      lambdaClient = new AWS.Lambda();
      service = new SimpleStatefulRecursiveService({}, lambdaClient, lambdaContext);
      sinon.spy(service, 'execute');
      sinon.spy(service, '_runAction');
      sinon.spy(service, 'action');
    });

    describe('#execute()', () => {
      it('executes recursive function exactly once', (done) => {
        service.execute().then(() => {
          expect(service.execute).to.have.been.calledTwice;
          expect(service._runAction).to.have.been.calledOnce;
          expect(service.action).to.have.been.calledOnce;
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
