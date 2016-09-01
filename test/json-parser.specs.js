/*globals describe, it */
const chai = require( 'chai' )
const sinon = require( 'sinon' )
const sinonChai = require( 'sinon-chai' )
const JSONParser = require( '../lib/json-parser' )

const expect = chai.expect
chai.use( sinonChai )

describe( 'JSON parser', function() {
  it( 'should return the same object if an object is given as input', function() {
    let jsonParser = new JSONParser()
    let doneSpy = sinon.spy()
    let passThroughObject = {
      my: 'initial',
      object: [ 'is', 'this' ]
    }

    jsonParser._transform( passThroughObject, 'utf8', doneSpy )

    expect(doneSpy).to.be.always.calledWith( null, passThroughObject )
  })

  it( 'should fail if the given string is not valid JSON', function(){
    let jsonParser = new JSONParser()
    let doneSpy = sinon.spy()

    jsonParser._transform( 'just invalid JSON', 'utf8', doneSpy )

    expect( doneSpy.getCall(0).args[0] ).to.be.an.instanceof( Error )
  } )

  it( 'should fail if the given input is null', function(){
    let jsonParser = new JSONParser()
    let doneSpy = sinon.spy()

    jsonParser._transform( null, 'utf8', doneSpy )

    expect( doneSpy.getCall(0).args[0] ).to.be.an.instanceof( Error )
  } )

  it( 'should parse JSON if the given string is valid JSON', function(){
    let jsonParser = new JSONParser()
    let doneSpy = sinon.spy()

    jsonParser._transform( '{ "hey": "there" }', 'utf8', doneSpy )

    expect( doneSpy ).to.be.always.calledWith( null, { hey: 'there' } )
  } )

  it( 'should fail if the first argument is not an object nor a string', function(){
    let jsonParser = new JSONParser()
    let doneSpy = sinon.spy()

    jsonParser._transform( undefined, 'utf8', doneSpy )

    let returnError = doneSpy.getCall(0).args[0]

    expect( returnError ).to.be.an.instanceof( Error )
    expect( returnError.message ).to.equal( 'Could not parse JSON: the input data is not an object nor a string' )
  } )
})