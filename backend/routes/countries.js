import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/countries - Get all countries
router.get('/', (req, res) => {
  try {
    const countriesPath = path.join(__dirname, '../data/countries.json');
    const rawData = fs.readFileSync(countriesPath, 'utf8');
    const data = JSON.parse(rawData);
    res.json({ countries: data.countries || [] });
  } catch (error) {
    console.error('Error loading countries:', error);
    // Return fallback countries
    res.json({ 
      countries: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Singapore', 'France', 'Japan', 'China']
    });
  }
});

export default router;