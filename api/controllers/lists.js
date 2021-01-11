const List = require('../models/list');

/**
 * Anything controller.
 * @module controllers/lists
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.createList = (req, res) => {
  const list = new List(req.body);
  list.userId = req.user._id;
  list.save((err, list) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.status(201).json(list);
  });
};

module.exports.getLists = (req, res) => {
  var allList = [];
  List.find({
      userId: req.user._id
    })
    .exec()
    .then(listUser => {
      listUser.forEach(listUserElement => {
        allList.push(listUserElement);
      })
      req.user.share.forEach(shareUser => {
        List.find({
            userId: shareUser.id
          })
          .exec()
          .then(listShare => {
            listShare.forEach(listShareElement => {
              if (listShareElement.public) {
                allList.push(listShareElement);
              }
            })
            res.status(200).json(allList)
          })
          .catch(err => res.status(500).json({
            message: 'no list found :(',
            error: err
          }))
      })
    })
    .catch(err => res.status(500).json({
      message: 'no list found :(',
      error: err
    }));
};

module.exports.getListById = (req, res) => {
  const id = req.params.id;
  List.findById(id)
    .then((list) => {
      if (list.userId == req.user._id || req.user.isAdmin) {
        return res.status(200).json(list);
      } else {
        return res.status(403).json({
          message: 'unauthorized access'
        });
      }

    })
    .catch(err => res.status(404).json({
      message: `list not found`,
      error: err
    }));
};

module.exports.updateListById = (req, res) => {
  const id = req.params.id;
  List.findById(id)
    .then((list1) => {
      req.user.share.forEach(shareUser => {
        if (list1.userId == req.user._id || req.user.isAdmin || shareUser.id == list1.userId) {
          List.findByIdAndUpdate(id, {
            listName: req.body.listName,
            list: req.body.list,
            public: req.body.public
          },
          (err, list2) => {
            if (err) {
              return res.status(500).json(err);
            }
            res.status(202).json({
              msg: `list id ${list1._id} updated`
            });
          });
        } else {
          return res.status(403).json({
            message: 'unauthorized access'
          });
        }
      })
    })
    .catch(err => res.status(404).json({
      message: `list with id ${id} not found`,
      error: err
    }));
};

module.exports.deleteListById = (req, res) => {
  const id = req.params.id;
  List.findById(id)
    .then((list) => {
      if (list.userId == req.user._id || req.user.isAdmin) {
        List.findByIdAndDelete(id, (err, list) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.status(202).json({
            msg: `list id ${list._id} deleted`
          });
        });
      } else {
        return res.status(403).json({
          message: 'unauthorized access'
        });
      }
    })
    .catch(err => res.status(404).json({
      message: `list with id ${id} not found`,
      error: err
    }));
};