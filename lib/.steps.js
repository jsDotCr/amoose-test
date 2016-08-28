casper.amooseConfiguration = {"tmpPath":"","viewports":{"big":[1920,1200]}};
casper.amooseSteps = [];
casper.amooseSteps.push(
  function RideList(){
    // casper.viewport( 1920, 1200 )
    casper
    .open('../apollo/public/demos/molecules/ride/ride.html')
    .then(function(){
      casper.waitForSelector( '.ride__list',
        function success() {
          phantomcss.screenshot( '.ride__list', 'Rides list' )
        },
        function timeout() {
          casper.test.fail( 'Failed to match ".ride__list""' )
        }
      )
    })
  });