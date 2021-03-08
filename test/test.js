const assert = require("assert");
const { describe } = require("mocha");
var expect = require("expect.js");
const movieApi = require("./json/movieApi.json");
const movieApi2 = require("./json/movieApi2.json");
const currencyApi = require("./json/currencyApi.json");
const MudParser = require("../src/MudParser");

describe("Test MudParser with movie api", () => {
  it("test parsing movieApi", () => {
    const schema = {
      version: 1,
      parsers: [
        { key: "title", value: "data.movies.0.title" },
        { key: "imdbId", value: "data.movies.0.imdb_code" },
        { key: "image", value: "data.movies.0.small_cover_image" },
        { key: "source", value: "data.movies.0.trailers.0.url" },
        { key: "quality", value: "data.movies.0.trailers.0.quality" },
        { key: "seeds", value: "data.movies.0.trailers.0.seeds" },
        { key: "size", value: "data.movies.0.trailers.0.size" },
        { key: "type", value: "data.movies.0.trailers.0.type" },
      ],
    };

    const result = MudParser(schema, movieApi);
    assert(result.length === 2, result.length);
    for (let i = 0; i < 2; i++) {
      assert(result[i].title === movieApi.data.movies[i].title);
      assert(result[i].imdbId === movieApi.data.movies[i].imdb_code);
      assert(result[i].image === movieApi.data.movies[i].small_cover_image);
      assert(
        result[i].trailers.length === movieApi.data.movies[i].trailers.length,
      );
      result[i].trailers.map((trailer, tIndex) => {
        assert(trailer.source === movieApi.data.movies[i].trailers[tIndex].url);
        assert(
          trailer.quality === movieApi.data.movies[i].trailers[tIndex].quality,
        );
        assert(
          trailer.seeds === movieApi.data.movies[i].trailers[tIndex].seeds,
        );
        assert(trailer.size === movieApi.data.movies[i].trailers[tIndex].size);
        assert(trailer.type === movieApi.data.movies[i].trailers[tIndex].type);
      });
    }
  });

  it("test parsing movieApi with renaming middle object", () => {
    const schema = {
      version: 1,
      parsers: [
        { key: "title", value: "data.movies.0.title" },
        { key: "imdbId", value: "data.movies.0.imdb_code" },
        { key: "image", value: "data.movies.0.small_cover_image" },
        { key: "source", value: "data.movies.0.trailers|sources.0.url" },
        { key: "quality", value: "data.movies.0.trailers|sources.0.quality" },
        { key: "seeds", value: "data.movies.0.trailers|sources.0.seeds" },
        { key: "size", value: "data.movies.0.trailers|sources.0.size" },
        { key: "type", value: "data.movies.0.trailers|sources.0.type" },
      ],
    };

    const result = MudParser(schema, movieApi);
    assert(result.length === 2, result.length);
    for (let i = 0; i < 2; i++) {
      assert(result[i].title === movieApi.data.movies[i].title);
      assert(result[i].imdbId === movieApi.data.movies[i].imdb_code);
      assert(result[i].image === movieApi.data.movies[i].small_cover_image);
      assert(
        result[i].sources.length === movieApi.data.movies[i].trailers.length,
      );
      result[i].sources.map((source, tIndex) => {
        assert(source.source === movieApi.data.movies[i].trailers[tIndex].url);
        assert(
          source.quality === movieApi.data.movies[i].trailers[tIndex].quality,
        );
        assert(source.seeds === movieApi.data.movies[i].trailers[tIndex].seeds);
        assert(source.size === movieApi.data.movies[i].trailers[tIndex].size);
        assert(source.type === movieApi.data.movies[i].trailers[tIndex].type);
      });
    }
  });
});

describe("Test MudParser with movie api 2", () => {
  const schema = {
    version: 1,
    parsers: [
      { key: "title", value: "0.title" },
      { key: "imdbId", value: "0.imdb_code" },
      { key: "image", value: "0.cover_image" },
      { key: "source", value: "0.trailers.url" },
      { key: "quality", value: "0.trailers.quality" },
      { key: "seeds", value: "0.trailers.seeds" },
      { key: "size", value: "0.trailers.size" },
      { key: "type", value: "0.trailers.type" },
    ],
  };

  it("test parsing movieApi", () => {
    const result = MudParser(schema, movieApi2);
    assert(result.length === 2, result.length);
    for (let i = 0; i < 2; i++) {
      assert(result[i].title === movieApi2[i].title);
      assert(result[i].imdbId === movieApi2[i].imdb_code);
      assert(result[i].image === movieApi2[i].cover_image);
      assert(result[i].source === movieApi2[i].trailers.url);
      assert(result[i].quality === movieApi2[i].trailers.quality);
      assert(result[i].seeds === movieApi2[i].trailers.seeds);
      assert(result[i].size === movieApi2[i].trailers.size);
      assert(result[i].type === movieApi2[i].trailers.type);
    }
  });
});

describe("Test MudParser with currency api", () => {
  const schema = {
    version: 1,
    parsers: [
      { key: "currencyName", value: "23123.name" },
      { key: "currencySymbol", value: "23123.symbol" },
    ],
  };
  it("test parsing movieApi", () => {
    const result = MudParser(schema, currencyApi);
    assert(result.length === 8, result.length);
    result.map((res, index) => {
      assert(res.currencyName === currencyApi[index].name);
      assert(res.currencySymbol === currencyApi[index].symbol);
    });
  });
});

describe("MudParser schema checker", () => {
  it("throws when schema is not an object", () => {
    expect(MudParser)
      .withArgs([], [])
      .to.throwException(/MudParser schema has to be an object./);
  });
  it("throws when version not in schema", () => {
    expect(MudParser)
      .withArgs({}, [])
      .to.throwException(/MudParser requires version to be defined./);
  });
  it("throws when parsers not in schema", () => {
    expect(MudParser)
      .withArgs({ version: 1 }, [])
      .to.throwException(/MudParser requires parsers in the schema object./);
  });
  it("throws when parsers is not an array", () => {
    expect(MudParser)
      .withArgs({ version: 1, parsers: {} }, [])
      .to.throwException(/MudParser: parsers needs to be an array./);
  });
  it("throws when parsers array is empty", () => {
    expect(MudParser)
      .withArgs({ version: 1, parsers: [] }, [])
      .to.throwException(/MudParser: parsers array is empty./);
  });
  it("throws when parsers elements are not objects", () => {
    expect(MudParser)
      .withArgs({ version: 1, parsers: [[], []] }, [])
      .to.throwException(/MudParser: parser elements have to be objects./);
  });
  it("throws when parsers elements have no key property", () => {
    expect(MudParser)
      .withArgs({ version: 1, parsers: [{ value: "" }] }, [])
      .to.throwException(
        /MudParser: parser elements have to have key property./,
      );
  });
  it("throws when parsers elements have no value property", () => {
    expect(MudParser)
      .withArgs({ version: 1, parsers: [{ key: "" }] }, [])
      .to.throwException(
        /MudParser: parser elements have to have value property./,
      );
  });
});
