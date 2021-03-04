# mud-parser

> CAUTION: This package is currently experimental.

---

Mud parser can extract values from an API response and construct them into a predictable data type.

This is especially helpful for services that use more than one API source for a given service. Instead of writing different rules for each API, you can unify the responses.

## Install

`npm install mud-parser`

or

`yarn add mud-parser`

## Usage

**Schema:**

```js
{
    version: 1,
    url: 'https://some-api/some-endpoint?query=',
    parsers: [
      { key: "title", value: "data.movies.0.title" },
      { key: "imdbId", value: "data.movies.0.imdb_code" },
      { key: "realName", value: "data.movies.0.cast.0.full_name" },
      { key: "characterName", value: "data.movies.0.cast.0.character" },
    ],
}
```

**Outcome:**

```js
[
  {
    title: '12 Angry Men',
    imdbId: 'tt0050083',
    cast: [
      {
        realName: 'Martin Balsam',
        characterName: 'Juror 1'
      },
      {
        realName: 'John Fiedler',
        characterName: 'Juror 2'
      },
      ...
    ]
  },
  {
    title: 'Limelight',
    imdbId: 'tt0044837',
    cast: [
      {
        realName: 'Charles Chaplin',
        characterName: 'Calvero'
      },
      {
        realName: 'Claire Bloom',
        characterName: 'Thereza 'Terry' Ambrose'
      },
      ...
    ]
  },
]
```

### Syntax

---

An object can be acquired by:

`firstName`

Example:

```json
{
  "firstName": "Some name"
}
```

---

An array can be aquired by adding a dot, followed by a number:

`movies.0`
movies array would be acquired

Example:

```json
{
  "movies": ["12 Angry Men", "Limelight"]
}
```

`0.movie`
If the response is list of objects, each object's movie property would be acquired.

Example:

```json
[
  {
    "movie": "12 Angry Men"
  },
  {
    "movie": "Limelight"
  }
]
```

`0.movies.0`
Getting the array of objects inside an array.

Example:

```json
[
  {
    "movies": ["12 Angry Men", "Limelight"]
  },
  {
    "movies": ["Seven Samurai", "City of God"]
  }
]
```

## Limitations

The following limitations are planned to be fixed. Currently there is no way around them.

1. Flat API responses cannot be parsed correctly.

```json
{
  "abilities": [
    {
      "ability": {
        "name": "imposter"
      }
    },
    {
      "ability": {
        "name": "limber"
      }
    }
  ],
  "height": 3
}
```

Current result:

```js
[
  {
    abilities: {
      ability: {
        name: "limber",
      },
    },
  },
  {
    abilities: {
      ability: {
        name: "imposter",
      },
    },
  },
  {
    height: 3,
  },
];
```

2. An object cannot be forced to be assigned in an array.

```js
{
  version: 1,
  url: 'https://some-url',
  parsers: [
    {key: 'movies', value: 'movie'}
  ]
}
```

```json
{
  "movie": {
    "title": "12 Angry Men",
    "year": 1957
  }
}
```

Current result:

```js
{
  movies: {
    title: "12 Angry Men",
    year: 1957
  }
}
```

Optional expected schema:

```js
{
  version: 1,
  url: 'https://some-url',
  parsers: [
    {key: 'movies', value: 'movie.[0]'}
  ]
}
```

Optional expected result:

```js
{
  movies: [
    {
      title: "12 Angry Men",
      year: 1957,
    },
  ];
}
```
