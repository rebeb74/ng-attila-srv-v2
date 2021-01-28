const Event = require('../models/event');
const mongoose = require('mongoose');

/**
 * Anything controller.
 * @module controllers/events
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.createEvent = (req, res) => {
  const event = new Event(req.body);
  event.userId = req.user._id;
  event.save((err, event) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(201).json(event);
  });
};

module.exports.getEvents = (req, res) => {
  Event.find({
      userId: req.user._id
    })
    .sort({
      'createdOn': -1
    })
    .exec()
    .then((events) => res.status(200).json(events))
    .catch((err) => res.status(500).json({
      message: 'no events found :(',
      error: err
    }));
};

module.exports.getEventById = (req, res) => {
  const id = req.params.id;
  Event.findById(id)
    .then((event) => {
      if (event.userId == req.user._id || req.user.isAdmin) {
        return res.status(200).json(event);
      } else {
        return res.status(403).json({
          message: 'unauthorized access'
        });
      }

    })
    .catch((err) => res.status(404).json({
      message: 'event not found',
      error: err
    }));
};

module.exports.getShareEventsByUserId = (req, res) => {
  const id = req.params.id;
  if (req.user.share != []) {
    req.user.share.forEach((shareUser) => {
      if (id == shareUser.id) {
        Event.find({userId: id})
        .then((event) => {
            return res.status(200).json(event);
        })
        .catch((err) => res.status(404).json({
          message: `event with id ${id} not found`,
          error: err
        }));
      } else {
        return res.status(403).json({
          message: 'unauthorized access'
        });
      }

    });
  } else {
    return res.status(404).json({
      message: 'share empty'
    });
  }

};

module.exports.updateEventById = (req, res) => {
  const id = req.params.id;
  Event.findById(id)
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
    .catch((err) => res.status(404).json({
      message: `event with id ${id} not found`,
      error: err
    }));
};

module.exports.deleteEventById = (req, res) => {
  const id = req.params.id;
  Event.findById(id)
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
    .catch((err) => res.status(404).json({
      message: `event with id ${id} not found`,
      error: err
    }));
};

module.exports.deleteEventsByIds = (req, res) => {
  const ids = req.query.ids;
  // split events
  const allIds = ids.split(',').map((id) => {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return mongoose.Types.ObjectId((id));
    } else {
      console.log('id is not valid', id);
    }
  });
  const condition = {
    _id: {
      $in: allIds
    }
  };
  if (req.user.isAdmin) {
    Event.deleteMany(condition, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(202).json(result);
    });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};
