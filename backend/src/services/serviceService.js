import {
  getAllServices,
  createService,
  updateService,
  deleteService
} from '../repositories/serviceRepository.js';

export async function listServices() {
  return getAllServices();
}

export async function addService(data) {
  if (!data.name || !data.duration_minutes || !data.price) {
    throw new Error('Missing required fields');
  }
  return createService(data);
}

export async function editService(id, data) {
  const updated = await updateService(id, data);
  if (!updated) {
    throw new Error('Service not found');
  }
  return updated;
}

export async function removeService(id) {
  await deleteService(id);
}
