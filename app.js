const express = require('express');
const rateLimit = require('express-rate-limit');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const currencies = require('./currencies.json');

require('dotenv').config();
const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;

const limiter = rateLimit({
  windowMs: 1000,
  max: 1
});

app.use(limiter);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api', async (req, res) => {
  try{
    if (!req.query.currencies)
      return errorMessage(res, 'No currecies provided')

    const currencies = req.query.currencies.split(',');

    if (Object.keys(currencies).length != 2)
      return errorMessage(res, 'Wrong currencies provided')

    const apiResponse = await fetch(`http://data.fixer.io/api/latest?access_key=${apiKey}&base=EUR&symbols=${currencies[0]},${currencies[1]}`).catch(() => {return errorMessage(res, 'Could not connect with the API')})

    const response = await apiResponse.json();

    if (!response.success)
      return errorMessage(res, 'Error connecting with the API')

    if (Object.keys(response).length < 2)
      return errorMessage(res, 'Wrong currencies provided')

    const rate = response.rates[currencies[1].toUpperCase()] / response.rates[currencies[0].toUpperCase()]

    return res.json({
			success: true,
			rate: rate,
		})
    
  }
  catch (err){
    return res.status(500).json({
			success: false,
			message: err.message,
		})
  }
})

app.get('/api/currencies', async (req, res) => {
  return res.json(currencies)
})

app.listen(port, () => {
  console.log(`API listening to http://localhost:${port}`)
})

const errorMessage = (res, message) => {
  return res.status(500).json({
    success: false,
    message: message,
  })
}