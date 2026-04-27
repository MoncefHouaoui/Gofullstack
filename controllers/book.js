const Thing = require('../models/Thing');
const fs = require('fs');

function computeAverageRating(ratings) {
  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const total = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return total / ratings.length;
}

exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.book);
  delete thingObject._id;
  delete thingObject._userId;

  const thing = new Thing({
    ...thingObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    averageRating: computeAverageRating(thingObject.ratings)
  });

  thing.save()
    .then((savedThing) => res.status(201).json(savedThing))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  delete thingObject._userId;
  delete thingObject.ratings;
  delete thingObject.averageRating;

  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      return Thing.updateOne(
        { _id: req.params.id },
        { ...thingObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: 'livre modifié !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Thing.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllThing = (req, res, next) => {
  Thing.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedThings = (req, res, next) => {
  Thing.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateThing = (req, res, next) => {
  const userId = req.auth.userId;
  const grade = Number(req.body.rating);

  if (Number.isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'Note invalide' });
  }

  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (!thing) {
        return res.status(404).json({ message: 'Livre introuvable' });
      }

      const existingRating = thing.ratings.find(
        (rating) => rating.userId === userId
      );

      if (existingRating) {
        existingRating.grade = grade;
      } else {
        thing.ratings.push({ userId, grade });
      }

      const total = thing.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      thing.averageRating = total / thing.ratings.length;

      return thing.save();
    })
    .then((updatedThing) => res.status(200).json(updatedThing))
    .catch((error) => res.status(400).json({ error }));
};