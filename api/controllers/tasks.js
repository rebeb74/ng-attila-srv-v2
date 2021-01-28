const Task = require('../models/task');
const mongoose = require('mongoose');

/**
 * Anything controller.
 * @module controllers/tasks
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.createTask = (req, res) => {
    const task = new Task(req.body);
    task.userId = req.user._id;
    task.save((err, task) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(201).json(task);
    });
};

module.exports.createTaskByUserId = (req, res) => {
    const id = req.params.id;
    const task = new Task(req.body);
    task.userId = id;
    task.save((err, task) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(201).json(task);
    });
};

module.exports.getTasks = (req, res) => {
    Task.find({
            userId: req.user._id
        })
        .sort({
            'createdOn': -1
        })
        .exec()
        .then((tasks) => res.status(200).json(tasks))
        .catch((err) => res.status(500).json({
            message: 'no tasks found :(',
            error: err
        }));
};

module.exports.getTaskById = (req, res) => {
    const id = req.params.id;
    Task.findById(id)
        .then((task) => {
            if (task.userId == req.user._id || req.user.isAdmin) {
                return res.status(200).json(task);
            } else {
                return res.status(403).json({
                    message: 'unauthorized access'
                });
            }

        })
        .catch((err) => res.status(404).json({
            message: `task with id ${id} not found`,
            error: err
        }));
};

module.exports.getShareTasksByUserId = (req, res) => {
    const id = req.params.id;
    if (req.user.share != []) {
      req.user.share.forEach((shareUser) => {
        if (id == shareUser.id) {
          Task.find({userId: id})
          .then((task) => {
              return res.status(200).json(task);
          })
          .catch((err) => res.status(404).json({
            message: 'task not found',
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

module.exports.updateTaskById = (req, res) => {
    const id = req.params.id;
    Task.findById(id)
        .then((task) => {
            if (task.userId == req.user._id || req.user.isAdmin) {
                Task.findByIdAndUpdate(id, {
                        title: req.body.title,
                        description: req.body.description,
                        startTime: req.body.startTime,
                        repeat: req.body.repeat,
                        altern: req.body.altern
                    },
                    (err, task) => {
                        if (err) {
                            return res.status(500).json(err);
                        }
                        res.status(202).json({
                            msg: `task id ${task._id} updated`
                        });
                    });
            } else {
                return res.status(403).json({
                    message: 'unauthorized access'
                });
            }
        })
        .catch((err) => res.status(404).json({
            message: `task with id ${id} not found`,
            error: err
        }));
};

module.exports.deleteTaskById = (req, res) => {
    const id = req.params.id;
    Task.findById(id)
        .then((task) => {
            if (task.userId == req.user._id || req.user.isAdmin) {
                Task.findByIdAndDelete(id, (err, task) => {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    res.status(202).json({
                        msg: `task id ${task._id} deleted`
                    });
                });
            } else {
                return res.status(403).json({
                    message: 'unauthorized access'
                });
            }
        })
        .catch((err) => res.status(404).json({
            message: `task with id ${id} not found`,
            error: err
        }));
};

module.exports.deleteTasksByIds = (req, res) => {
    const ids = req.query.ids;
    // split tasks
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
        Task.deleteMany(condition, (err, result) => {
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
