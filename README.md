# mud-parser


[![npm](https://img.shields.io/npm/v/mud-parser?style=for-the-badge)](https://www.npmjs.com/package/mud-parser) [![npm](https://img.shields.io/npm/dw/mud-parser?style=for-the-badge)](https://www.npmjs.com/package/mud-parser) ![NPM](https://img.shields.io/npm/l/mud-parser?style=for-the-badge)

> CAUTION: This package is currently experimental.

---

Mud parser can extract values from an API response and construct them into a predictable data type.

This is especially helpful for services that use more than one API source for a given service. Instead of writing different rules for each API, you can unify the responses.

## Install

`npm install mud-parser`

or

`yarn add mud-parser`

## Usage

**Import**

`import { MudParser } from 'mud-parser';`

`checkMudSchema` is also available.

**Usage**

`const result = MudParser(schema, response.data);`

**Schema example:**

```js
{
    version: 1,
    url: 'https://some-api/some-endpoint?query=',
    parsers: [
      { key: "title", value: "data.movies.0.title" },
      { key: "imdbId", value: "data.movies.0.imdb_code" },
      { key: "realName", value: "data.movies.0.cast|castMembers.0.full_name" },
      { key: "characterName", value: "data.movies.0.cast|castMembers.0.character" },
    ],
}
```

**Output:**

```js
[
  {
    title: '12 Angry Men',
    imdbId: 'tt0050083',
    castMembers: [
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
    castMembers: [
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

2. Value conversion is not supported. Currently there is no way to convert values into different types, including string -> number. A more challanging change Object -> Array or vice versa is also an important part that is missing.
