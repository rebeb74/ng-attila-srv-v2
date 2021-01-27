const express = require('express');
const Event = require('../models/event');
// const Socket = require('../models/socketUsers');
const {
    auth
} = require('../middleware');

module.exports = function (io) {
    const eventsRouter = express.Router();

    eventsRouter.post('/event', auth, async (req, res) => {
        try {

            const event = new Event(req.body);
            event.userId = req.user._id;
            event.save();
            res.status(201).json(event);

        } catch (error) {
            console.log(error)
            return res.status(500).json(error);
        }
    });

    eventsRouter.get('/events', auth, async (req, res) => {
        await Event.find({
            userId: req.user._id
          })
          .sort({
            'createdOn': -1
          })
          .exec()
          .then(events => res.status(200).json(events))
          .catch(err => res.status(500).json({
            message: 'no events found :(',
            error: err
          }));
    });

    eventsRouter.get('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Event.findById(id)
        .then((event) => {
          if (event.userId == req.user._id || req.user.isAdmin) {
            return res.status(200).json(event);
          } else {
            return res.status(403).json({
              message: 'unauthorized access'
            });
          }
    
        })
        .catch(err => res.status(404).json({
          message: `event not found`,
          error: err
        }));
    });

    eventsRouter.put('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        const event = await Event.findById(id)
        .then((event) => {
          if (event.userId == req.user._id || req.user.isAdmin) {
            Event.findByIdAndUpdate(id, {
                title: req.body.title,
                description: req.body.description,
                startTime: req.body.startTime,
                startHour: req.body.startHour,
                place: req.body.place,
                alert: req.body.alert
              },
              (err, event) => {
                if (err) {
                  return res.status(500).json(err);
                }
                res.status(202).json({
                  msg: `event id ${event._id} updated`
                });
              });
          } else {
            return res.status(403).json({
              message: 'unauthorized access'
            });
          }
        })
        .catch(err => res.status(404).json({
          message: `event with id ${id} not found`,
          error: err
        }));
    });

    eventsRouter.delete('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Event.findById(id)
        .then((event) => {
          if (event.userId == req.user._id || req.user.isAdmin) {
            Event.findByIdAndDelete(id, (err, event) => {
              if (err) {
                return res.status(500).json(err);
              }
              res.status(202).json({
                msg: `event id ${event._id} deleted`
              });
            });
          } else {
            return res.status(403).json({
              message: 'unauthorized access'
            });
          }
        })
        .catch(err => res.status(404).json({
          message: `event with id ${id} not found`,
          error: err
        }));
    });


    return eventsRouter;
};