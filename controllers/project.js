"use strict";

var Project = require("../models/project");

var controller = {
  home: (req, res) => {
    return res.status(200).send({ message: "soy la home" });
  },
  test: (req, res) => {
    return res.status(200).send({ message: "soy el metodo test" });
  },
  saveProject: (req, res) => {
    var project = new Project();
    var params = req.body;
    var { name, description, category, year, langs } = params;
    project.name = name;
    project.description = description;
    project.category = category;
    project.year = year;
    project.langs = langs;
    project.image = null;

    project.save((err, projectStored) => {
      if (err) return res.status(500).send({ message: "Error al guardar" });
      if (!projectStored)
        return res
          .status(404)
          .send({ message: "No se ha podido guardar el proyecto" });

      return res.status(200).send({ project: projectStored });
    });
  },
  getProject: (req, res) => {
    var projectId = req.params.id;

    if (projectId === null)
      return res.status(404).send({ message: "El proyecto no existe" });

    Project.findById(projectId, (err, project) => {
      if (err)
        return res.status(500).send({ message: "Error al devolver los datos" });

      if (!project)
        return res.status(404).send({ message: "El proyecto no existe" });

      return res.status(200).send({ project });
    });
  },
  getProjects: (req, res) => {
    Project.find({}).exec((err, project) => {
      if (err)
        return res.status(500).send({ message: "Error al devolver los datos" });

      if (!project)
        return res.status(404).send({ message: "El proyecto no existe" });

      return res.status(200).send({ project });
    });
  },
  updateProject: (req, res) => {
    var projectId = req.params.id;
    var update = req.body;

    Project.findByIdAndUpdate(projectId, update, (err, projectUpdate) => {
      if (err)
        return res.status(500).send({ message: "Error al devolver los datos" });

      if (!projectUpdate)
        return res.status(404).send({ message: "El proyecto no existe" });

      return res.status(200).send({ projectUpdate });
    });
  },
};

module.exports = controller;
