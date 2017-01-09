# otherapp

## Installation

```
npm install -g otherapp
```

## CLI

Will download `otherapp.bin` to your current working directory

```
otherapp <model> <version> <region>
```

eg.
```
otherapp n3ds 11.2.0-39 eur
```

## API

```
const otherapp = require('otherapp')

otherapp('n3ds', '11.2.0-39', 'eur', function (url) {
  console.log(url)
})
```
