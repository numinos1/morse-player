export interface TSubscriber {
  event: string;
  cb: Function;
}

/**
 * Emitter Class
 **/
export class Emitter {
  subscribers: TSubscriber[];

  /**
   * Constructor
   **/
  constructor() {
    this.subscribers = [];
  }

  /**
   * Subscribe
   **/
  on(event: string, cb: Function) {
    const subscriber: TSubscriber = { event, cb };

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
  emit(event: String, value: any) {
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