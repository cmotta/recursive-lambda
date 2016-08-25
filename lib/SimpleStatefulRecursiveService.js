var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ExecutionState = require('./ExecutionState');

var SimpleStatefulRecursiveService = (function () {
  function SimpleStatefulRecursiveService(params, lambdaClient, context) {
    _classCallCheck(this, SimpleStatefulRecursiveService);

    this.executionState = _ExecutionState.ExecutionState.INITIAL;
    this.lambdaClient = lambdaClient;
    this.lambdaName = context.functionName;
    this.context = context;
    this._state = params || {};
  }

  _createClass(SimpleStatefulRecursiveService, [{
    key: 'initState',
    value: function initState(newState) {
      return Object.assign(this._state, newState);
    }
  }, {
    key: '_getExecutionState',
    value: function _getExecutionState() {
      return this.executionState;
    }
  }, {
    key: '_isEnoughTimeLeft',
    value: function _isEnoughTimeLeft() {
      return this.context.getRemainingTimeInMillis() > this.executionThreshold;
    }
  }, {
    key: 'completeExecution',
    value: function completeExecution() {
      this.executionState = _ExecutionState.ExecutionState.COMPLETE;
    }
  }, {
    key: 'execute',
    value: function execute() {
      if (this._getExecutionState() === _ExecutionState.ExecutionState.INITIAL) {
        this.executionState = _ExecutionState.ExecutionState.IN_PROGRESS;
        return this._runAction();
      } else if (this._isExecutionCompleted()) {
        return _bluebird2['default'].resolve();
      } else if (this._readyForNextRecursiveCall()) {
        return this._runAction();
      } else if (this._noTimeForNextRecursiveCall()) {
        return this._invokeLambda();
      }
      return _bluebird2['default'].resolve();
    }
  }, {
    key: '_readyForNextRecursiveCall',
    value: function _readyForNextRecursiveCall() {
      return this.executionInvariant && this._getExecutionState() === _ExecutionState.ExecutionState.IN_PROGRESS && this._isEnoughTimeLeft();
    }
  }, {
    key: '_isExecutionCompleted',
    value: function _isExecutionCompleted() {
      return this._getExecutionState() === _ExecutionState.ExecutionState.COMPLETE;
    }
  }, {
    key: '_noTimeForNextRecursiveCall',
    value: function _noTimeForNextRecursiveCall() {
      return this._getExecutionState() === _ExecutionState.ExecutionState.IN_PROGRESS && !this._isEnoughTimeLeft();
    }
  }, {
    key: '_runAction',
    value: function _runAction() {
      var _this = this;

      return this.action(this.state)['catch'](function (e) {
        _this.errorCallback(e);
        return _bluebird2['default'].resolve();
      }).then(function () {
        return _this.execute();
      });
    }
  }, {
    key: 'errorCallback',
    value: function errorCallback() {}
  }, {
    key: '_invokeLambda',
    value: function _invokeLambda() {
      var _this2 = this;

      this.beforeInvokeLambda();
      return new _bluebird2['default'](function (resolve, reject) {
        var payload = _this2.state;
        var params = {
          FunctionName: _this2.lambdaName,
          InvocationType: 'Event',
          Payload: JSON.stringify(payload)
        };
        _this2.lambdaClient.invoke(params, function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
  }, {
    key: 'action',

    /*
    This where your action goes
    Ex: listen to SQS and process messages as long as required
    Or load records from DynamoDB. params could contain reference to the next page
    Should return a promise
    */
    value: function action() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _bluebird2['default'].resolve();
    }

    /*
    Updates service state.
    Ex: You loaded records from DynamoDB and there is a next page
    You store next page in this.state so further recursive calls could move on and load next page.
    Also if lambda runs out of time, next invoked lambda will have to know where to start.
    Otherwise, lambda will just load first page all over again.
    */
  }, {
    key: 'updateState',
    value: function updateState() {
      var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var overwrite = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

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
  }, {
    key: 'beforeInvokeLambda',

    /*
    Before next lambda is invoked
    you may save some intermediate state
    Ex: In report aggregator function,
    you could store an intermediate result aka report
    instead of passing array of reports/records to the next lambda
    Alternatively, You could do the same with this.updateState somewhere
    in your function
    */
    value: function beforeInvokeLambda() {
      this.updateState({});
    }
  }, {
    key: 'onRecursionComplete',
    value: function onRecursionComplete() {
      this.updateState({});
    }
  }, {
    key: 'state',
    get: function get() {
      return this._state;
    }
  }, {
    key: 'executionThreshold',
    get: function get() {
      return 60000;
    }
  }, {
    key: 'executionInvariant',
    get: function get() {
      return false;
    }
  }]);

  return SimpleStatefulRecursiveService;
})();

module.exports.SimpleStatefulRecursiveService = SimpleStatefulRecursiveService;