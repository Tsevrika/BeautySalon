import { pool } from "../utils/db.js";

export async function getAllServices() {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY created_at DESC");
  return rows;
}

export async function createService({ name, description, price, duration_minutes }) {
  const { rows } = await pool.query(
    `INSERT INTO services (name, description, price, duration_minutes, category)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [name, description, price, duration_minutes]
  );
  return rows[0];
}

export async function updateService(id, { name, description, price, duration_minutes, category }) {
  const { rows } = await pool.query(
    `UPDATE services
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         duration_minutes = COALESCE($4, duration_minutes)
         category = COALESCE($5, category)
     WHERE id = $6
     RETURNING *`,
    [name, description, price, duration_minutes, id]
  );
  return rows[0];
}

export async function deleteService(id) {
  const result = await pool.query("DELETE FROM services WHERE id = $1", [id]);
  return result.rowCount > 0;
}
