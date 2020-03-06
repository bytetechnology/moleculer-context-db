import MikroConnector from '../../service.databases/mikro.connector';

describe('MikroConnector', () => {
  test('it throws an error on init with invalid dbType', async done => {
    const connector = new MikroConnector();
    await expect(
      connector.init(
        'invalid' as 'postgresql',
        'test',
        'test',
        './',
        []
      )
    ).rejects.toThrow();
    done();
  });
});
