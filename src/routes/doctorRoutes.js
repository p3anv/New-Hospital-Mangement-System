const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController'); // <-- Must point to the file above
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(protect, doctorController.getDoctors)
  .post(protect, authorize('admin'), doctorController.createDoctor);

router.route('/:id')
  .get(protect, doctorController.getDoctorById)
  .put(protect, authorize('admin'), doctorController.updateDoctor)
  .delete(protect, authorize('admin'), doctorController.deleteDoctor);

module.exports = router;