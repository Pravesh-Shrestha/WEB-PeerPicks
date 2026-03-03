import { notificationController } from '../../../controllers/notification.controller';
import { notificationService } from '../../../services/notification.service';

jest.mock('../../../services/notification.service');

type ResMock = {
  status: jest.Mock;
  json: jest.Mock;
  write: jest.Mock;
  setHeader: jest.Mock;
};

describe('notificationController', () => {
  const makeRes = (): ResMock => {
    const res: ResMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      write: jest.fn(),
      setHeader: jest.fn(),
    } as any;
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('getMyNotifications returns data', async () => {
    (notificationService.getUserSignals as jest.Mock).mockResolvedValue(['n1']);
    const req: any = { user: { _id: 'u1' } };
    const res = makeRes();

    await notificationController.getMyNotifications(req, res as any);

    expect(notificationService.getUserSignals).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: ['n1'] });
  });

  it('getMyNotifications handles errors', async () => {
    (notificationService.getUserSignals as jest.Mock).mockRejectedValue(new Error('boom'));
    const req: any = { user: { _id: 'u1' } };
    const res = makeRes();

    await notificationController.getMyNotifications(req, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'FETCH_ERROR: boom' });
  });

  it('establishStream 401s when user missing', async () => {
    const req: any = { user: null, on: jest.fn() };
    const res = makeRes();

    await notificationController.establishStream(req, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'AUTH_REQUIRED' });
  });

  it('establishStream registers SSE client and broadcast writes, then cleans on close', async () => {
    jest.useFakeTimers();
    const write = jest.fn();
    const setHeader = jest.fn();
    let closeHandler: any;
    const req: any = { user: { _id: 'u1' }, on: jest.fn((evt: string, cb: any) => { if (evt === 'close') closeHandler = cb; }) };
    const res: any = { setHeader, write };

    await notificationController.establishStream(req, res);

    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(write).toHaveBeenCalledWith(expect.stringContaining('SIGNAL_LINK_ESTABLISHED'));

    write.mockClear();
    notificationController.broadcastToUser('u1', { type: 'COMMENT', foo: 'bar' });
    expect(write).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));

    // simulate disconnect and ensure future broadcasts are ignored
    write.mockClear();
    closeHandler && closeHandler();
    jest.runOnlyPendingTimers();
    notificationController.broadcastToUser('u1', { type: 'VOTE' });
    expect(write).not.toHaveBeenCalled();
  });

  it('broadcastToUser logs when no active client', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    notificationController.broadcastToUser('ghost', { type: 'SYSTEM' });

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('getUnreadCount 401 when no user', async () => {
    const req: any = { user: null };
    const res = makeRes();

    await notificationController.getUnreadCount(req, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'PROTOCOL_ERROR: Node identity not found' });
  });

  it('getUnreadCount returns count', async () => {
    (notificationService.getUnreadSignalCount as jest.Mock).mockResolvedValue(4);
    const req: any = { user: { _id: 'u1' } };
    const res = makeRes();

    await notificationController.getUnreadCount(req, res as any);

    expect(notificationService.getUnreadSignalCount).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: 4 });
  });

  it('markAsRead returns success', async () => {
    (notificationService.syncReadStatus as jest.Mock).mockResolvedValue(true);
    const req: any = { user: { _id: 'u1' } };
    const res = makeRes();

    await notificationController.markAsRead(req, res as any);

    expect(notificationService.syncReadStatus).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Node synchronized.' });
  });

  it('markAsRead handles error', async () => {
    (notificationService.syncReadStatus as jest.Mock).mockRejectedValue(new Error('fail'));
    const req: any = { user: { _id: 'u1' } };
    const res = makeRes();

    await notificationController.markAsRead(req, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'fail' });
  });

  it('deleteNotification returns success', async () => {
    (notificationService.deleteSignal as jest.Mock).mockResolvedValue(true);
    const req: any = { user: { _id: 'u1' }, params: { id: 'nid' } };
    const res = makeRes();

    await notificationController.deleteNotification(req, res as any);

    expect(notificationService.deleteSignal).toHaveBeenCalledWith('nid', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Signal deleted from node memory.' });
  });
});
