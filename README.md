# Events

`@dimkl/events` is a **dependency-free** JS library for listening & dispatching events on class methods.

## Installation

Use the package manager [npm](https://nodejs.org/en/download/) to install `@dimkl/events`

```bash
npm install @dimkl/events
```

## Requirements & limitations

- node >= 16
- typescript decorators support enabled in tsconfig using `"experimentalDecorators": true`

## Usage

Examples can be found in `examples/` folder:

- [Minimal example](./examples/minimal.ts)
- [Implcit event attachment example](./examples/impplicit-event-attach.ts)
- [Isolated event bus example](./examples/isolated-event-bus.ts)
- [Minimal implicit event attachment (with options) example](./examples/event-options.ts)

### Use examples

Execute `npm run setup:examples`

## Testing

[![codecov](https://codecov.io/gh/dimkl/events/branch/main/graph/badge.svg?token=VHYWTFBNHB)](https://codecov.io/gh/dimkl/events)

### Run tests

```
npm test
```

## Support
For feature request or issues contact me via [email](mailto:dimitris.klouvas@gmail.com) or open an issue in repo

## Publish

```
npm version {patch|minor|major}
npm publish
```

## Injecting events types

The injected event types will be used with `@on` decorator methods and they should be 
defined using interface merging strategy. Example:
```typescript
declare global {
  interface {{eventName}}Event extends IEvent {
    type: "{{eventName}}"
    data?: {{any_data_type}}
  }

  interface Events {
    "{{eventName}}": {{eventName}}Event
  }
}
```

You can also check the `ErrorEvent` definition in codebase.

## Roadmap

- [x] Add tests & code coverage
- [x] Add .github/{ISSUE|PULL_REQUEST}
- [ ] Changelog & Github Releases
- [x] Isomorphic support
- [x] Code coverage shield
- [ ] Features
    - [-] @on/dispatch on functions -- not possible
    - [x] @on/dispatch on class
    - [x] @on/dispatch for static & instance methods
    - [ ] remove event(s) on eventBus
    - [x] inject events and event types
- [ ] Github action to publish (if test pass & coverage not affected)
    - [ ] on chore -> patch
    - [ ] on fix -> patch
    - [ ] on feat -> minor
    - [ ] on fix|feat with (BREAKING CHANGE) -> major
- [x] Support react-native (EventTarget is not supported)

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[ISC](https://choosealicense.com/licenses/isc/)