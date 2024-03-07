import { Player } from './player';
import { TBufferEntry } from './script';

/**
 * Queue Entry
 **/
// export interface TBufferEntry {
//   name: string;
//   value: any;
//   startTime: number;
//   endTime: number;
// }

/**
 * Schedule Class
 **/
export class Schedule {
  queue: TBufferEntry[];
  event: TBufferEntry;
  headTime: number;
  tailTime: number;
  queueSize: number;
  player: Player;
  
  /**
   * Constructor
   **/
  constructor(player: Player) {
    this.queue = [];
    this.event = null;

    this.headTime = 0;      // current playback time
    this.tailTime = 0;      // end of last scheduled event
    this.queueSize = 1;     // target size of schedule (tailTime - headTime)

    this.player = player;
  }
  
  /**
   * Reset the queue and return last pending
   **/
  reset(): TBufferEntry {
    const next = this.queue[0];

    this.queue = [];
    this.event = null;
    this.headTime = 0;
    this.tailTime = 0;

    return next;
  }

  /**
   * Can Push Time?
   **/
  canPush(currentTime: number): boolean {
    this.headTime = currentTime;

    if (!this.tailTime) {
      this.tailTime = currentTime;
    }
    return (this.tailTime < (this.headTime + this.queueSize));
  }

  /**
   * Push entry and return endTime
   **/
  push(entry: TBufferEntry) {
    this.queue.push(entry);
    this.tailTime = entry.endTime;
  }

  /**
   * Advance schedule and return next
   **/
  advance(): boolean {
    while (this._endCurrentEvent()
      || this._startNextEvent()) 
    {}
   
    return !!(this.queue.length || this.event);
  }

  /**
   * End the current event
   **/
  _endCurrentEvent(): boolean {
    if (this.event
      && this.event.endTime <= this.headTime
    ) {
      if (this.event.name === 'play') {
        this.player.emit('char:end', this.event);
      }
      this.event = null;

      return true;
    }
    return false;
  }

  /**
   * Start the next event
   **/ 
  _startNextEvent() {
    if (this.queue.length
      && this.queue[0].startTime <= this.headTime
    ) {
      this.event = this.queue.shift();

      if (this.event.name === 'play') {
        this.player.emit('char:start', this.event);
      }
      else {
        this.player.setOptions(
          typeof this.event.value === 'object'
            ? this.event.value
            : {}, // should neve happen, but just in caase
          true
        );
      }

      return true;
    }
    return false;
  }
}