import * as service from '../services/appointmentService.js';
import * as repo from '../repositories/appointmentRepository.js';

export const markDone = async (req, res, next) => {
  try {
    const appointment = await repo.markAsDone(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ message: 'Appointment not found or cannot be completed' });
    }

    res.json(appointment);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.createAppointment(req.user.id, req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const my = async (req, res) => {
  const data = await repo.getByUser(req.user.id);
  res.json(data);
};

export const master = async (req, res) => {
  try {
    const items = await repo.getByMasterUser(req.user.id);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load master appointments' });
  }
};

export const admin = async (_, res) => {
  const data = await repo.getAll();
  res.json(data);
};

export const cancel = async (req, res) => {
  await repo.cancel(req.params.id);
  res.json({ success: true });
};
