import { beforeEach, describe, expect, mock, test } from "bun:test";
import createSyntaxFactory from "@/index";

let mockRequestResolvedValue: Request | undefined = undefined;
let mockResolvedRequestText: any = undefined;

const mockFetch = mock(async (request) => {
  mockRequestResolvedValue = request;
  mockResolvedRequestText = await request.text();

  return Response.json({
    results: [],
  });
});

global.fetch = mockFetch;

describe("factory", () => {
  let { get, set, create, drop, count, batch } = {} as ReturnType<
    typeof createSyntaxFactory
  >;

  beforeEach(() => {
    ({ get, set, create, drop, count, batch } = createSyntaxFactory({}));

    mockFetch.mockClear();
    mockRequestResolvedValue = undefined;
    mockResolvedRequestText = undefined;
  });

  test("send correct `queries` for single `get` request", async () => {
    await get.accounts();

    expect(mockResolvedRequestText).toEqual(
      '{"queries":[{"get":{"accounts":{}}}]}',
    );
  });
});
