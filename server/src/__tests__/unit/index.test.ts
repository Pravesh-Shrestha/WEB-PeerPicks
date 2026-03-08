jest.mock('../../app', () => ({
  __esModule: true,
  default: { listen: jest.fn((port: any, host: any, cb?: Function) => cb && cb()) },
}));
jest.mock('../../database/database.db', () => ({ connectDB: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../config/index', () => ({ PORT: 5000, ALLOWED_ORIGINS: [] }));

import { connectDB } from '../../database/database.db';
import app from '../../app';

describe('server index bootstrap', () => {
  it('connects to DB then starts server', async () => {
    jest.isolateModules(() => {
      require('../../index');
    });

    await new Promise((resolve) => setImmediate(resolve));

    expect(connectDB).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith(5000, '0.0.0.0', expect.any(Function));
  });
});
