import * as repo from '../repositories/appointmentRepository.js';
import { pool } from '../utils/db.js';

const WORK_START_MIN = 8 * 60;
const WORK_END_MIN   = 20 * 60;
const MIN_LEAD_MINUTES = 30;

function getMinutesInNL(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hh = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
  const mm = Number(parts.find(p => p.type === 'minute')?.value ?? 0);

  return hh * 60 + mm;
}

export const createAppointment = async (userId, body) => {
  const { master_id, service_id, start_at } = body;

  if (!master_id || !service_id || !start_at) {
    throw new Error('Missing required fields');
  }

  const masterResult = await pool.query(
    'SELECT is_active FROM masters WHERE id = $1',
    [master_id]
  );

  if (!masterResult.rows[0] || masterResult.rows[0].is_active !== true) {
    throw new Error('Master is not available');
  }

  const providesService = await repo.isServiceProvidedByMaster(
    master_id,
    service_id
  );

  if (!providesService) {
    throw new Error('This master does not provide the selected service');
  }

  const service = await repo.getServiceDuration(service_id);
  if (!service) throw new Error('Service not found');

  const start = new Date(start_at);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid date');
  }

  if (start < new Date()) {
    throw new Error('Cannot book an appointment in the past');
  }

  const minStart = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000);
  if (start < minStart) {
    throw new Error(
      `Appointment must be booked at least ${MIN_LEAD_MINUTES} minutes in advance`
    );
  }

  const end = new Date(
    start.getTime() + service.duration_minutes * 60 * 1000
  );

  const startMin = getMinutesInNL(start);
  const endMin   = getMinutesInNL(end);

  if (startMin < WORK_START_MIN || endMin > WORK_END_MIN) {
    throw new Error('Appointment is allowed only between 08:00 and 20:00');
  }

  const conflicts = await repo.getConflicts(
    master_id,
    start,
    end
  );

  if (conflicts.length > 0) {
    throw new Error('Time is not available');
  }

  return repo.createAppointment({
    user_id: userId,
    master_id,
    service_id,
    start_at: start,
    end_at: end
  });
};
