const express = require("express");
const router = express.Router();
const Airport = require("../models/airport");
const axios = require("axios");
const _ = require("lodash");

router.post("/", async (req, res) => {
  const terminals = ["T1", "T2"];

  //From 12pm to 1pm on Jan 29 2018
  const begin = req.body.begin; //1517227200
  const end = req.body.end; //1517230800
  var b = new Date(begin * 1000);
  var e = new Date(end * 1000);
  let newArray = [];
  const arrivalTest = await Airport.find({
    arrivalDateTimestamp: {
      $gte: new Date(b.setDate(b.getDate() - 1)),
      $lt: new Date(e.setDate(e.getDate() + 1)),
    },
  }).sort({ arrivalTime: -1 });

  console.log(arrivalTest);
  if (arrivalTest && arrivalTest.length === 0) {
    try {
      const response = await axios.get(
        `https://opensky-network.org/api/flights/arrival?airport=EDDF&begin=${begin}&end=${end}`
      );

      if (response && response.data) {
        newArray = response.data
          .map((data) => {
            const terminal =
              terminals[Math.floor(Math.random() * terminals.length)];

            return {
              name: data.estArrivalAirport,
              arrivalTimestamp: data.firstSeen * 1000,
              departureTimestamp: data.lastSeen * 1000,
              arrivalDateTimestamp: new Date(data.firstSeen * 1000),
              arrivalTime: new Date(data.firstSeen * 1000).getTime(),
              departureDateTimestamp: new Date(data.lastSeen * 1000),
              departureTime: new Date(data.lastSeen * 1000).getTime(),
              terminal: terminal,
            };
          })
          .sort((a, b) => parseInt(a.arrivalTime) - parseInt(b.arrivalTime));
      }

      await Airport.collection.insertMany(newArray.flat());
      res.send(newArray);
    } catch (err) {
      console.log(err);
      res.send("Data is not available.");
    }
  } else {
    res.json(arrivalTest);
  }
});

// router.post('/',async(req,res)=>{
//    const airportData = new Airport({
//        name : req.body.name,
//        terminal: req.body.terminal,
//        arrivalDate: req.body.arrivalDate,
//        departureDate: req.body.departureDate
//    });

//    try{
//     const saved = await airportData.save()
//     res.json(saved);
//    }catch(err){
//        res.send('Error')
//    }

// });

//http://localhost:5000/airport/T2
// router.get('/:terminal',async(req,res)=>{
//     try{
//         console.log(req.params.terminal);
//     const airportTerminalData = await Airport.find({terminal:req.params.terminal});
//     res.json(airportTerminalData);
//     }catch(err){
//         res.send('Error', err);
//     }
// });

router.get("/:terminal", async (req, res) => {
  try {
       
    const airportData = await Airport.find({
      arrivalTimestamp: {$gte: 1525942800 * 1000},
      terminal: req.params.terminal,
    }).sort({ arrivalTime: 1 });

    let extractedAirportData = airportData.map(
      ({ arrivalTimestamp, departureTimestamp, terminal }) => ({
        arrivalTimestamp,
        departureTimestamp,
        terminal
      })
    );
    let flag = 0;
    
    let result = [];
    getNonConflictedPlanes(extractedAirportData);
   
    function getNonConflictedPlanes(data) {
      if (flag == 0) {
        result.push(data[0]);
        data.shift();
        flag++;
        getNonConflictedPlanes(data);
      }
      for (let i = 0; i < data.length; i++) {
        if (
          data[i].arrivalTimestamp >
          result[result.length - 1].departureTimestamp
        ) {
          result.push(data[i]);
          data.splice(0, i);
          if (data.length) {
            getNonConflictedPlanes(data);
          } else {
            break;
          }
        }
      }
    }

    res.json(result);
  } catch (err) {
    res.send("Error", err);
  }
});

module.exports = router;