"use strict";

const Preconditions = require("preconditions"),
  _ = require("lodash"),
  Promise = require("bluebird");

const Scenario = require("./scenario"),
  Mock = require("../mocks/mock"),
  ErrorFactory = require("../plugins/error-factory"),
  constants = require("../constants");

const preconditions = Preconditions.errr();

class HttpReqScenario extends Scenario {
  constructor(testContext) {
    super(testContext);

    this.HttpResponseMock = {};
    this._finishedHasBeenSet_ = false;
  }

  // TODO: resDoesError / resDoesReturn

  /**
   * Provides same functionality as 'withInputParams' but it provides a lexical name that matches the HttpReqScenario.
   *
   * @param {Object} request - An object representing the structure of a Node HttpRequest. Most common things to add
   * are 'body', 'params', 'query', etc. But you can put anything you'd like into this object.
   * @returns {Scenario}
   */
  withHttpRequest(request) {
    preconditions.shouldBeArray(request, ErrorFactory.build(constants.errorMessages.HttpRequestArray))
      .debug({request: request}).test();

    this._inputParams_ = request;
    return this;
  }

  /**
   * This function is synonymous with the 'shouldBeCalledWith' function except here we are mocking a function on the
   * HttpResponse object that is passed into the controller with the HttpRequest object. Common functions to mock here
   * send, json, statusCode, etc. You can test the parameters of any function execution on the response object.
   *
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @param {Object} params - An object representing an HttpRequest object.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithFunctionString))
      .debug({funcName: funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray))
      .debug({params: params}).test();

    this.HttpResponseMock[funcName] = this.HttpResponseMock[funcName] || function () {};
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    if (constants.ResponseEndFunctions[funcName]) {
      preconditions.checkArgument(!this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
        .debug({finishedHasBeenSet: this._finishedHasBeenSet_, responseFinishers: _.keys(constants.ResponseEndFunctions)}).test();

      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants.ResponseMockName, funcName);
      this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    }

    return this;
  }

  /**
   * This function is synonomous with the 'doesReturn' function except here we are defining what is returned from a mocked
   * function on the HTTP Response object. i.e. Defines what to return during a success scenario from a **synchronous**
   * mocked function on the HTTP Response object.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesReturn(funcName, dataToReturn) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName: constants.ResponseMockName, funcName}).test();

    this._mock_.doesReturn(constants.ResponseMockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function
   * on the HTTP Response Object. The dataToReturn will be returned on every execution of the mock. That means you only
   * need to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesAlwaysReturn(funcName, dataToReturn) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName: constants.ResponseMockName, funcName}).test();

    this._mock_.doesAlwaysReturn(constants.ResponseMockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * Some Http libraries in Node allow chainable functionality. For example, the following is a common express paradigm:
   * res.statusCode(200).send(result). To ensure Maddox allows a chainable interface like this, it allows the user to define
   * which functions should be chainable by using the 'resDoesReturnSelf'.  For the status code example, you would want
   * to add 'resDoesReturnSelf("statusCode")' to your scenario.
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @returns {HttpReqScenario}
   */
  resDoesReturnSelf(funcName) {
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    return this;
  }

  _setTestRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);

    this._testRunnable_ = () => {
      return new Promise((resolve) => {
        this._mock_.setCallbackForResponseEnd(resolve);

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      });
    };
  }

  _setPerfRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);

    this._perfRunnable_ = (sampleDone) => {
      this._mock_.setCallbackForResponseEnd(() => {
        sampleDone();
      });

      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    };
  }

  _validateScenario_(testable) {
    const inputParams = this._getInputParams_();
    const entryPointFunction = this._getEntryPointFunction_();
    const hasFinisherBeenSet = this._hasFinishedBeenSet_();

    preconditions.shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({testable}).test();

    preconditions.shouldBeDefined(entryPointFunction, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({entryPointFunction}).test();

    preconditions.shouldBeDefined(inputParams, ErrorFactory.build(constants.errorMessages.HttpReqUndefined))
      .debug({inputParams}).test();

    preconditions.checkArgument(hasFinisherBeenSet, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
      .debug({responseFinishers: Object.keys(constants.ResponseEndFunctions)}).test();

  }
}

module.exports = HttpReqScenario;