/**
 * Emitter Class
 **/
export class Emitter {

  /**
   * Constructor
   **/
  constructor() {
    this.subscribers = [];
  }

  /**
   * Subscribe
   **/
  on(event, cb) {
    const subscriber = { event, cb };

    this.subscribers.push(subscriber);

    return () => {
      this.subscribers = this.subscribers.filter(sub => 
        sub !== subscriber
      );
    }
  }

  /**
   * Emit
   **/
  emit(event, value) {
    const subscribers = this.subscribers;

    for (let i = 0; i < subscribers.length; ++i) {
      const subscriber = subscribers[i];

      if (subscriber.event === '*' || 
        subscriber.event === event
      ) {
        subscriber.cb(event, value);
      }
    }
  }
}