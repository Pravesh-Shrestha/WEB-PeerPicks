import request from 'supertest';
import app from '../../app'; // Adjust the path as needed

export const testApp = request(app);