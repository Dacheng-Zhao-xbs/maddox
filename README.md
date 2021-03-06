# Maddox
For more detailed documentation, please see our [readme.io](https://maddox.readme.io/docs) page.

### Behavior Driven Development (BDD) In A Scenario Testing Framework
Maddox provides a simple way to rapidly unit test complex success and 
failure scenarios which can be driven by responses of mocked external 
dependencies.

Maddox allows you to test all of your functional business requirements 
and test performance, from end to end without hitting external dependencies.
Perfect for unit testing a service in a Micro Services or a Service Oriented
Architecture (SOA) environment.

[![Build Status](https://travis-ci.org/corybill/maddox.svg?branch=master)](https://travis-ci.org/corybill/maddox)
[![Dependency Status](https://david-dm.org/corybill/maddox.svg)](https://david-dm.org/corybill/maddox)
[![Join the chat at https://gitter.im/corybill/maddox](https://badges.gitter.im/corybill/maddox.svg)](https://gitter.im/corybill/maddox?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![view on npm](http://img.shields.io/npm/v/maddox.svg)](https://www.npmjs.org/package/maddox)
[![npm module downloads](http://img.shields.io/npm/dt/maddox.svg)](https://www.npmjs.org/package/maddox)

## Why Should You Use Maddox?
https://maddox.readme.io/docs/i-should-be-using-maddox-because

## Best Practices
1. All external dependencies should be wrapped or decorated (See Decorator Design Pattern) within a proxy layer.  See ./spec/testable for an example application.
2. Tests should enter the application, the same place a user would enter.  For most services, this means the Controller Layer.
3. All Scenario's are executed asynchronously.  This means that every 'it' block will need to utilize the 'done' function to indicate the test is complete.

## Recommendations
1. If at all possible, your proxy layer should utilize a stateless pattern as it is easier to write and debug tests.  See ./spec/testable/proxies for examples.

## How To Use Maddox
The best way to learn is to see it in action.

1. Testing a Service - ./spec/unit/http-req-unit-test
2. Testing a library - https://github.com/corybill/Preconditions/tree/master/spec
3. Testing a library - https://github.com/corybill/Optional/tree/master/spec

### Scenario Constants
There are a few constants that Maddox exposes that will make it easier to use. They can be used like this:
```
const Maddox = require("maddox");

Maddox.constants.IgnoreParam
Maddox.constants.EmptyResult
Maddox.constants.EmptyParameters
```

1. IgnoreParam - If you replace a parameter within a 'shouldBeCalledWith' (or any of its variants) function call, then
that parameter will not validated.
2. EmptyResult - When your mocked function doesn't have a return value, you can use the EmptyResult constant instead of
passing in undefined.
2. EmptyParameters - When your mocked function has no expected parameters, you can use the EmptyParameters constant instead
of saying empty array.

### Scenario API
Maddox uses the philosophy of Scenario testing.  All scenarios use the same base api.

### HttpRequestScenario Example
<pre>
    new Scenario(this) // Create a new Scenario
      .mockThisFunction("ProxyClass", "getFirstName", ProxyClass) // Mock ProxyClass.getFirstName
      .mockThisFunction("ProxyClass", "getMiddleName", ProxyClass) // Mock ProxyClass.getMiddleName
      .mockThisFunction("ProxyClass", "getLastName", ProxyClass) // Mock ProxyClass.getLastName

      .withEntryPoint(Controller, "read") // Declare Controller.read to be the entry point for the test
      .withHttpRequest(httpRequestParams) // Use the object 'httpRequestParams' as the input into the Controller
      // NOTE: The HTTP Response Object is created by Maddox and passed in automatically.

      .resShouldBeCalledWith("send", expectedResponse) // Test that res.send is called with the same parameters that are defined in 'expectedResponse'
      .resShouldBeCalledWith("status", expectedStatusCode) // Test that res.status is called with the same parameters that are defined in 'expectedStatusCode'
      .resDoesReturnSelf("status") // Allow Express's expected chainable call res.status().send()

      .shouldBeCalledWith("ProxyClass", "getFirstName", getFirstName1Params) // Test that the first call to ProxyClass.getFirstName is called with the same parameters that are defined in 'getFirstName1Params'
      .doesReturnWithPromise("ProxyClass", "getFirstName", getFirstName1Result) // When ProxyClass.getFirstName is called for the first time, return 'getFirstName1Result' using Promise A+ protocol

      .shouldBeCalledWith("ProxyClass", "getFirstName", getFirstName2Params) // Test that the second call to ProxyClass.getFirstName is called with the same parameters that are defined in 'getFirstName2Params'
      .doesReturnWithPromise("ProxyClass", "getFirstName", getFirstName2Result) // When ProxyClass.getFirstName is called for the second time, return 'getFirstName2Result' using Promise A+ protocol

      .shouldBeCalledWith("ProxyClass", "getMiddleName", getMiddleNameParams) // Test that the first call to ProxyClass.getMiddleName is called with the same parameters that are defined in 'getMiddleNameParams'
      .doesReturn("ProxyClass", "getMiddleName", getMiddleNameResult) // When ProxyClass.getMiddleName is called for the first time, return 'getMiddleNameResult' synchronously

      .shouldBeCalledWith("ProxyClass", "getLastName", getLastNameParams) // Test that the first call to ProxyClass.getLastName is called with the same parameters that are defined in 'getLastNameParams'
      .doesReturnWithCallback("ProxyClass", "getLastName", getLastNameResult) // When ProxyClass.getLastName is called for the first time, return 'getLastNameResult' using the callback paradigm. i.e. callback(err, result)

      .test(done); // Executes the test.  Up to this point, we have only build out the test context.  No tests are executed until the test function is called.
      // NOTE: All scenarios are asynchronous. Ensure that that 'done' function is passed in or executed by you.
</pre>

## Maddox API

## mockThisFunction(mockName, funcName, object)
Mock any function from a given object.  The most common use case would be to mock out a function in your proxy layer. 

* **mockName** *{String}* - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
* **funcName** *{String}* - The name of the function to be mocked.
* **object** *{Object}* - The object that contains the function to be mocked.
* **returns** *{Scenario}*

******************************************************

## withTestFinisherFunction(mockName, funcName, iteration)
Set a mocked proxy function as the finisher function for the test. When the finisher function is executed, the test will be considered complete, the mocks will begin being tested, and then the provided testable function will be executed. i.e. By setting this function, you are telling Maddox when the test is complete. 

A common use case for using this function, is if you want to execute a set of code asynchronously but you don't care about the result. For Example: Let's say you want to call an HTTP endpoint to execute some code, but you want the HTTP endpoint to provide an immediate acknowledgement. In other words, you want to end the HTTP Request without waiting for the code behind the Http endpoint to be finished. Even though you want the HTTP request to finish immediately, you still want to test that the other mocks are called with the expected parameters. Normally when using the HttpReqScenario, your finisher function is automatically assigned within Maddox. Often the finisher function will be res.send, because that is the function that is commonly used to finish Http Requests via Express. This function will now tell Maddox that the execution is complete, and that Maddox can begin testing the mocks. By setting a finisher function, you are now telling Maddox to wait until finisher function has been executed before beginning to test the mocks. 

As always, there are detailed examples in the unit tests of Maddox to see how this can be used. But I will also be publishing specific examples of this use case since it isn't that common. 

* **mockName** *{String}* - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
* **funcName** *{String}* - The name of the function to be mocked.
* **[iteration]** *{Number}* - Defaults to 0. The finisher function will be executed the nth time this mocked proxy function is executed. Iterations start at 0. So if you want the finisher function to called on the second time a mocked proxy is called, then you would pass in 1.
* **returns** *{Scenario}*

******************************************************

## withEntryPoint(entryPointObject, entryPointFunction)
Defines where to begin the test. 

* **entryPointObject** *{Object}* - The object to start the test from.
* **entryPointFunction** *{String}* - The function within the object to start the test from.
* **returns** *{Scenario}*

******************************************************

## withInputParams(inputParamsIn)
These are the input params into the function that you would like to test. The input params is an array representation of all the parameters. 

* **inputParamsIn** *{Array}* - Array of parameters. The first function parameter goes into index 0 and the nth parameter goes into index n.
* **returns** *{Scenario}*

******************************************************

## shouldBeCalledWith(mockName, funcName, params)
Defines an expectation for a mocked function. i.e. after your test is complete, Maddox will compare the actual parameters the mock was called with to the defined exepected parameters from this function.  If a mocked function (from 'mockThisFunction') is called once, then 'shouldBeCalledWith' should be defined once for that mocked function. If a mocked function is called 'n' times, then 'shouldBeCalledWith' should be defined 'n' times for that mocked function. 

Ordering matters when defining these expectations. If your function is called 3 times, Maddox will compare the first set of actual parameters to the first set of defined expected parameters and so on. 

If your function takes a callback you should NOT add this to the params array. The callback will be automatically validated during execution when you use 'doesReturnWithCallback'. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **params** *{Array}* - An array of expected parameters. First parameter of the function goes in index 0 and the nth parameter of the function goes into index n.
* **returns** *{Scenario}*

******************************************************

## shouldAlwaysBeCalledWith(mockName, funcName, params)
A variant of 'shouldBeCalledWith' that defines a mocked function should be called with the same expected parameters on every call to the mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **params** *{Array}* - An array of expected parameters. First parameter of the function goes in index 0 and the nth parameter of the function goes into index n.
* **returns** *{Scenario}*

******************************************************

## shouldAlwaysBeIgnored(mockName, funcName)
A variant of 'shouldBeCalledWith' that defines the parameters being passed into a given mocked function should never be tested. 

I was hesitant to add this functionality as it can easily be abused. That being said, there are some valid use cases but you should always think twice before using this function as you are essentially saying that you do not care about testing this mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **returns** *{Scenario}*

******************************************************

## doesReturn(mockName, funcName, dataToReturn)
Defines what to return during a success scenario from a **synchronous** mocked function. 

Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why? For every mocked function, we test that it is called with the expected, and then return something from the mocked function to continue driving the scenario through your code. 

Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will return the response of the first defined response from 'doesReturn' or one of its variants. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed.
* **returns** *{Scenario}*

******************************************************

## doesAlwaysReturn(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function. The dataToReturn will be returned on every execution of the mock. That means you only need to define one return value for all calls to the mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed.
* **returns** *{Scenario}*

******************************************************

## doesReturnWithPromise(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that returns a **promise**. 

Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why? For every mocked function, we test that it is called with the expected, and then return something from the mocked function to continue driving the scenario through your code. 

Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will return the response of the first defined response from 'doesReturn' or one of its variants. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed. This data will be available in the next step of your promise chain.
* **returns** *{Scenario}*

******************************************************

## doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that returns a **promise**. The dataToReturn will be returned on every execution of the mock. That means you only need to define one return value for all calls to the mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed. This data will be available in the next step of your promise chain.
* **returns** *{Scenario}*

******************************************************

## doesReturnWithCallback(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that expects results to be returned in a **callback**. 

Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the last parameter and execute it with the provided dataToReturn. 

The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be added in the callback function. 

Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why? For every mocked function, we test that it is called with the expected, and then return something from the mocked function to continue driving the scenario through your code. 

Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will return the response of the first defined response from 'doesReturn' or one of its variants. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Array}* - An array of parameters that will be applied (.apply) to the provided callback function.
* **returns** *{Scenario}*

******************************************************

## doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that expects results to be returned in a **callback**. The dataToReturn will be returned on every execution of the mock. That means you only need to define one return value for all calls to the mock. 

Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the last parameter and execute it with the provided dataToReturn. 

The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be added in the callback function. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Array}* - An array of parameters that will be applied (.apply) to the provided callback function.
* **returns** *{Scenario}*

******************************************************

## doesError(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. Defines what to return during a failure scenario from a **synchronous** mocked function. To force the error scenario, the mocked function will throw the dataToReturn. Best practice dictates that you only throw Javascript Error objects. Therefore, you should be providing a Node Error object in the dataToReturn property. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Error}* - The Error object to be thrown.
* **returns** *{Scenario}*

******************************************************

## doesErrorWithPromise(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that returns a **promise**. To force the error scenario, the mocked function will reject using the dataToReturn causing the first catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript Error objects. Therefore, you should be providing a Node Error object in the dataToReturn property. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Error}* - The Error object to be rejected.
* **returns** *{Scenario}*

******************************************************

## doesErrorWithCallback(mockName, funcName, dataToReturn)
This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that expects results to be returned in a **callback**. There is absolutely no difference between 'doesErrorWithCallback' and 'doesReturnWithCallback'. It is instead up to user to define the response parameters in the dataToReturn array. In other words, if you want an error scenario, you just need to ensure the err object is defined in your dataToReturn array of parameters. 

Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the last parameter and execute it with the provided dataToReturn. 

This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that returns a **promise**. To force the error scenario, the mocked function will throw the dataToReturn causing the first catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript Error objects. Therefore, you should be providing a Node Error object in the dataToReturn property. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Error}* - The Error object to be passed into .
* **returns** *{Scenario}*

******************************************************

## noDebug()
By default, when a comparison fails, Maddox will place a stringified version of the actual and expected results into the stack trace so the user can see what is wrong.  When noDebug is added to a scenario, Maddox will no longer provide the expected and actual in the stack trace debug params.
* **returns** *{Scenario}*

******************************************************

## test(testable)
Initiates the test. This will call the entry point function with given input params. When the function is done executing, it will test that all of mocked functions were called with the expected parameters, and then call the testable function that was the parameter for the test function. 

If testing the HttpReqScenario, Maddox call into the controller function using your input params as the request and mocking out the response for you. When a response finishing function (i.e. send, json, end, etc) is called on the response object, Maddox will begin validating the request. It will first test that all functions mocked on the response were called with the expected values. Next it will test that all of mocked functions were called with the expected parameters. And finally it will call function that was the parameter for the test function. Usually for the HttpReqScenario, you can just pass in the 'done' function from your testing framework. 

* **testable** *{Function}* - A function to test or to end the test.  This function will be called with two parameters, err and result. In other words, 'testable(err, result)'.
* **returns** *{Promise} - Nothing gets resolved on a successful resolution of this promise chain. But you can use the promise to handle errors thrown from the 'test' function to ensure you do not allow false positives.*

******************************************************

## withHttpRequest(request)
Provides same functionality as 'withInputParams' but it provides a lexical name that matches the HttpReqScenario. 

* **request** *{Object}* - An object representing the structure of a Node HttpRequest. Most common things to add are 'body', 'params', 'query', etc. But you can put anything you'd like into this object.
* **returns** *{Scenario}*

******************************************************

## resShouldBeCalledWith(funcName, params)
This function is synonymous with the 'shouldBeCalledWith' function except here we are mocking a function on the HttpResponse object that is passed into the controller with the HttpRequest object. Common functions to mock here send, json, statusCode, etc. You can test the parameters of any function execution on the response object. 

* **funcName** *{String}* - The name of the function to be mocked on the HttpResponse object.
* **params** *{Object}* - An object representing an HttpRequest object.
* **returns** *{HttpReqScenario}*

******************************************************

## resShouldAlwaysBeCalledWith(funcName, params)
A variant of 'shouldBeCalledWith' that defines a mocked function on the response object that should be called with the same expected parameters on every call to the Response Mock 

* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **params** *{Array}* - An array of expected parameters. First parameter of the function goes in index 0 and the nth parameter of the function goes into index n.
* **returns** *{HttpReqScenario}*

******************************************************

## resShouldContainHeader(headerName, headerValue, funcName)
A variant of 'shouldBeCalledWith' specifically designed for Http Headers. This function mocks the 'set' function (or the provided function name) on the response mock. This function should be used to set a header in the response. 

In Express, you use the following syntax for for setting a header 'res.set("headerKey", "headerValue");'. 

* **headerName** *{String}* - The name of the header. i.e. The key.
* **headerValue** *{String}* - The value of the header.
* **[funcName]** *{String}* - Defaults to Expresses .set function.
* **returns** *{HttpReqScenario}*

******************************************************

## resShouldAlwaysBeIgnored(funcName)
A variant of 'shouldBeCalledWith' that defines the parameters being passed into a given mocked function should never be tested. 

I was hesitant to add this functionality as it can easily be abused. That being said, there are some valid use cases but you should always think twice before using this function as you are essentially saying that you do not care about testing this mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **returns** *{HttpReqScenario}*

******************************************************

## resDoesReturn(funcName, dataToReturn)
This function is synonymous with the 'doesReturn' function except here we are defining what is returned from a mocked function on the HTTP Response object. i.e. Defines what to return during a success scenario from a **synchronous** mocked function on the HTTP Response object. 

Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will return the response of the first defined response from 'doesReturn' or one of its variants. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed.
* **returns** *{Scenario}*

******************************************************

## resDoesAlwaysReturn(funcName, dataToReturn)
This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function on the HTTP Response Object. The dataToReturn will be returned on every execution of the mock. That means you only need to define one return value for all calls to the mock. 

* **mockName** *{String}* - This is the key for the mock. It should match the key from 'mockThisFunction'.
* **funcName** *{String}* - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
* **dataToReturn** *{Any}* - The data that will be returned when this mocked function is executed.
* **returns** *{Scenario}*

******************************************************

## resDoesReturnSelf(funcName)
Some Http libraries in Node allow chainable functionality. For example, the following is a common express paradigm: res.statusCode(200).send(result). To ensure Maddox allows a chainable interface like this, it allows the user to define which functions should be chainable by using the 'resDoesReturnSelf'.  For the status code example, you would want to add 'resDoesReturnSelf("statusCode")' to your scenario.* **funcName** *{String}* - The name of the function to be mocked on the HttpResponse object.
* **returns** *{HttpReqScenario}*

******************************************************

## static equal(actual, expected, message, context)
Does a deep comparison of actual and expected using Chai.js ([Deep Equals](http://chaijs.com/api/bdd/#method_eql). If the comparison fails, it will throw with a pretty printed version of the expected and actual params to the stacktrace. This functionality is provided by the [Errr](https://www.npmjs.com/package/errr) module. If an error message is provided, it will be used in the error message if the comparison fails. 

* **actual** *{Object}* - The actual value for comparison.
* **expected** *{Object}* - The expected value for comparison.
* **[message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context]** *{Object}* - Holds different configuration options.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append the actual and expected in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static truthy(value, message, context)
Validate that the value resolves to truthy using Chai.js ([to.be.ok](http://chaijs.com/api/bdd/#method_ok). 

* **value** *{Object}* - The value for comparison. If this value is truthy then the test will pass.
* **[message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context]** *{Object}* - Holds different configuration options.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append debug info in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static falsey(value, message, context)
Validate that the value resolves to falsey using Chai.js ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok). 

* **value** *{Object}* - The value for comparison. If this value is falsey then the test will pass.
* **[message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context]** *{Object}* - Holds different configuration options.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append debug info in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static shouldEqual(context)
Synonymous with shouldBeEqual, but with different definition. Does a deep comparison of actual and expected using Chai.js ([Deep Equals](http://chaijs.com/api/bdd/#method_eql). If the comparison fails, it will throw with a pretty printed version of the expected and actual params to the stacktrace. This functionality is provided by the [Errr](https://www.npmjs.com/package/errr) module. If an error message is provided, it will be used in the error message if the comparison fails. 

* **context** *{Object}* - A context object holding 3 main parameters: actual, expected, and message. Also holds configuration params.
* **context.actual** *{Object}* - The actual value for comparison.
* **context.expected** *{Object}* - The expected value for comparison.
* **[context.message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append the actual and expected in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static shouldBeTruthy(context)
Synonymous with shouldBeTruthy, but with different definition. Validate that the value resolves to truthy using Chai.js ([to.be.ok](http://chaijs.com/api/bdd/#method_ok). 

* **context** *{Object}* - A context object holding 2 main parameters: value and message. Also holds configuration params.
* **context.value** *{Object}* - The value for comparison. If this value is truthy then the test will pass.
* **[context.message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append debug info in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static shouldBeFalsey(context)
Synonymous with falsey, but with different definition. Validate that the value resolves to falsey using Chai.js ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok). 

* **context** *{Object}* - A context object holding 2 main parameters: value and message. Also holds configuration params.
* **context.value** *{Object}* - The value for comparison. If this value is falsey then the test will pass.
* **[context.message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append debug info in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static shouldBeFalsy(context)
Equivalent to 'shouldBeFalsey'. Validate that the value resolves to falsey using Chai.js ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok). 

* **context** *{Object}* - A context object holding 2 main parameters: value and message. Also holds configuration params.
* **context.value** *{Object}* - The value for comparison. If this value is truthy then the test will pass.
* **[context.message]** *{String}* - The message added to the Errr if the comparison fails.
* **[context.noDebug]** *{Boolean}* - If set to true, Maddox will not append debug info in the stacktrace. Defaults to false.
* **returns** *nothing*

******************************************************

## static shouldBeUnreachable(message)
Function will always fail with a message stating that this line of code should not be executed. A common use case for this would be in the catch block of a test to ensure that you are actually verifying the did not throw. If you do not add some test in a catch block, you are test could be throwing but since you aren't catching it, it could give you a false positive. 

* **[message]** *{String}* - Define the message to fail with. The default message is: 'It should be impossible to reach this code.'.
* **returns** *nothing*

******************************************************
