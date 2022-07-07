window.$ = window.jQuery = require('jquery'); //import jQuery: do cool javascript things with html

//import our node packages (javscripts packages)
const Binance = require('node-binance-api');
const Chartist = require("chartist");

//set constant
const minUSDValue = 5;

//define sum equation
const sum = (a, b) => a + b;

Binance.options({
  'APIKEY': 'gE2qCUCjvj082p70eogwl0E2mdo0GQ8ItkEk6gepDKmMniVcAFoHB2t3Hswq8tpV',
  'APISECRET': '7cfTkotbUr0hknx9xcSsrKt3F2130ykSzvsJnCP7PIW43SyZ6wgJ0vU7nKVTorAW'
});



//default data for the chart
var chartData = {
  series: [1, 1, 1],
};

//create variables/objects we will use later
let wallet = new Object;
let chart, btcPrice, valueInBTC, total = 0;

//grabs wallets with coins in them
//starts update loop
function initalize() {

  chart = new Chartist.Pie('.ct-chart', chartData, {
    labelInterpolationFnc: (value) => (Math.round(value / chartData.series.reduce(sum) * 100) + '%'),
    labelOffset: 60,
    chartPadding: 20
  });

  Binance.balance(function(balances) {

    for (var coin in balances) {


      if (parseFloat(balances[coin].available) != '0') {
        $('.grid').append('<div id="' + coin + '" class="row"><item>' + coin + '</item><item>' + balances[coin].available + '</item><item>' + 0 + '</item><item>$0<item></div>');

        wallet[coin] = balances[coin];

      }

    }
  });
  update();

  setInterval(update, 10000);
}

//updates btc price and dashboard
function update() {
  Binance.bookTickers(function(ticker) {
    btcPrice = parseFloat(ticker.BTCUSDT.ask);
    updateDashboard();
  });
}

function updateDashboard() {
  //store the new chart data
  let tempData = [];
  Binance.prices(function(ticker) {
    var available, dollarValue, BTCValue;
    for (var coin in wallet) {

      //do different math depending on if btc is the coin or USDT.
      //Why: all coins are measured in BTC, but you cant measure btc in btc: btc is measured in dollars(approx USTD).
      //     similar situtaion for USTD(its not measured in btc).

      switch (coin) {
        case "BTC":
          available = parseFloat(wallet[coin].available) + parseFloat(wallet[coin].onOrder);
          dollarValue = btcPrice * available;
          BTCValue = (available / btcPrice).toFixed(8);

          break;
        case "USDT":
          //amount of USDT we have is how much its worth: 1USDT = 1USD.

          available = parseFloat(wallet[coin].available) + parseFloat(wallet[coin].onOrder);
          BTCValue = available / btcPrice;
          dollarValue = available;

          setCoinData(coin, available, BTCValue, dollarValue);

          break;
        default:

          BTCValue = parseFloat(ticker[coin + 'BTC']);
          available = parseFloat(wallet[coin].available) + parseFloat(wallet[coin].onOrder);
          dollarValue = BTCValue * btcPrice * available;

          setCoinData(coin, available, BTCValue, dollarValue);

          break;
      }

      // if the dollar value is a real value
      if (!isNaN(dollarValue)) {
        total += dollarValue;

        if (dollarValue > minUSDValue) {
          tempData.push(dollarValue);
        }

      }
      setCoinData(coin, available, BTCValue, dollarValue);
    }
    //set the chart data and update the updateDashboard
    setPortfolioTotal();
    chartData.series = tempData;
    chart.update();

  });
}

//sets the data in html for the coins
function setCoinData(coin, available, valueInBTC, dollarValue) {

  //html stuff
  $('#' + coin).html('<item>' + coin + '</item><item>' + available.toFixed(8) + '</item><item>' + (available * valueInBTC).toFixed(8) + '</item><item>' + dollarValue.toFixed(2) + '<item>');
  //
}

//updates Portfolio price
function setPortfolioTotal() {
  $('#total').html('Total: $' + total.toFixed(3));
  total = 0;
}

//initializes dashboard and chart
//stars updateloop
initalize();
