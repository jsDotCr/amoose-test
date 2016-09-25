const chai = require( 'chai' )
const sinon = require( 'sinon' )
const sinonChai = require( 'sinon-chai' )
const fs = require( 'fs' )
const StepsWriter = require( '../lib/steps-writer' )

const expect = chai.expect
chai.use( sinonChai )

describe( 'Steps writer', function(){
  const testFile = './test/.test-file'
  this.slow( 10 )

  before( 'Setup test file', function( done ) {
    fs.writeFile( testFile, '', ( err ) => {
      if ( !err ) {
        done()
      }
    } )
  } )

  it( 'fails if no arguments are provided', function(){
    const stepsWriter = new StepsWriter()
    const doneCb = sinon.spy()

    stepsWriter._transform( {}, 'utf8', doneCb )

    expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
    expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Configuration object missing' )
  } )

  it( 'fails if no test suite path is provided', function(){
    const stepsWriter = new StepsWriter()
    const doneCb = sinon.spy()

    stepsWriter._transform( {
      config: {
        paths: {}
      }
    }, 'utf8', doneCb )

    expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
    expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Invalid test suite path provided' )
  } )

  it( 'fails if the test suite path is not a/is an empty string', function(){
    const stepsWriter = new StepsWriter()
    const doneCb = sinon.spy()

    stepsWriter._transform( {
      config: {
        paths: {
          testSuite: ''
        }
      }
    }, 'utf8', doneCb )

    expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
    expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Invalid test suite path provided' )
  } )

  it( 'fails if no steps have been provided at all', function(){
    const stepsWriter = new StepsWriter()
    const doneCb = sinon.spy()

    stepsWriter._transform( {
      config: {
        paths: {
          testSuite: 'file.js'
        },
      },
      jsSteps: null
    }, 'utf8', doneCb )

    expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
    expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'No steps have been provided' )
  } )

  it( 'fails if invalid Javascript has been provided as steps to execute', function(){
    const stepsWriter = new StepsWriter()
    const doneCb = sinon.spy()

    stepsWriter._transform( {
      config: {
        paths: {
          testSuite: 'file.js'
        },
      },
      jsSteps: {}
    }, 'utf8', doneCb )

    expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
    expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'No steps have been provided' )
  } )

  it( 'calls the fs.writeFile function', function( done ) {
    const stepsWriter = new StepsWriter()
    const fsWrite = sinon.spy( fs, 'writeFile' )

    stepsWriter._transform( {
      config: {
        paths: {
          testSuite: testFile
        },
      },
      jsSteps: 'function randomStuff(){}'
    }, 'utf8', done )

    expect( fsWrite ).to.have.been.calledOnce.and.have.been.calledWith( testFile )

    fs.writeFile.restore()
  } )

  after( 'Tear down test file', function( done ) {
    fs.unlink( testFile, done )
  } )
} )
