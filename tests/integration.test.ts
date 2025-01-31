import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createSyntaxFactory } from 'ronin';

let mockResolvedRequestText: string | undefined;

const mockFetch = mock(async (request) => {
  mockResolvedRequestText = await request.text();

  return Response.json({
    results: [],
  });
});

global.fetch = mockFetch;

describe('factory', () => {
  let { get } = {} as ReturnType<typeof createSyntaxFactory>;

  beforeEach(() => {
    ({ get } = createSyntaxFactory({}));

    mockFetch.mockClear();
    mockResolvedRequestText = undefined;
  });

  test('send correct `queries` for single `get` request', async () => {
    await get.accounts();

    expect(mockResolvedRequestText).toEqual('{"queries":[{"get":{"accounts":{}}}]}');
  });
});
