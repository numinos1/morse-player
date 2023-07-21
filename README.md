# Morse Player

This is a browser based morse code audio player that implements audio scheduling to accurately synchronize morse code audio playback with browser callback events for correlating UI and audio rendering. It also implements options inheritance, a rich scripting engine, glitchless pausing, and word-level rewind. It doesn't include any external dependencies and is very lightweight (just a few kilobytes uncompressed).

----------

# Getting Started

Initialize the player with system default options.

```js
const player = new Player({
  volume: 0.7,
  gain: 0.5,
  freq: 600,
  q: 10,
  wpm: 25,
  eff: 25,
  color: '#fff'
});
```

Bind to events to capture player behavior.

```js
const cancel = player.on('options', console.log);
const cancel = player.on('play:start', console.log);
const cancel = player.on('play:stop', console.log);
const cancel = player.on('play:resume', console.log);
const cancel = player.on('play:pause', console.log);
const cancel = player.on('play:rewind', console.log);
```

Setter for user options, and getter for aggregated options objects.

```js
player.setOptions({ volume: 0.6 });
const options = player.getOptions();
```

Play a script, with optional script scoped options. This needs to happen within the context of a click-event within the browser for the audio to start playing.

```js
player.play("Hello World", { wpm: 30 });
player.stop();
player.pause();
player.replay();
player.rewind(wordCount = 1);
```

-----------

## Player

The core application

## Options

The options system consists of four layers:

1. System Options (defined on player creation)
2. User Options (set at any time with setOptions())
3. Script Options (set at playtime and optionally within the play script)
4. Comined Options (the combined system->user->script options)

## Emitter

Capture audio events to trigger UI changes.

## Audio

The core audio driver the plays the characters.

## Schedule

The schedule is how the player schedules events to coincide with the playing audio.

## Script

The script renders the raw player text into playable characters. This expands any programatic directives within the script to set options or dynamically render text with actions.

## Actions

Programatic directives within a player script to set options or dynamically render text.

```text
[set wpm:25 [+ ]
```

# Inspirations

- [Audio Scheduling](https://web.dev/audio-scheduling/)
- [Speed Rendering](https://web.dev/speed-rendering/)
- [Audio Scheduler](https://www.npmjs.com/package/web-audio-scheduler/v/1.3.0)
- [JSCW Lib](https://fkurz.net/ham/jscwlib.html)

# Class Structure

- Player
  - Options
  - Emitter
  - Audio
  - Schedule
  - Script
    - Render
      - Parse
        - Tokenize
      - Actions