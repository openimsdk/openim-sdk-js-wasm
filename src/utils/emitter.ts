import { SdkEventEnvelope } from '@/types/entity';
import { SdkEvent } from '../constant';
import { SdkEventData } from '../types/eventData';

interface Events {
  [key: string]: Cbfn<any>[];
}

type Cbfn<E extends SdkEvent> = (
  data: SdkEventEnvelope<SdkEventData<E>>
) => void;

class Emitter {
  private events: Events;

  constructor() {
    this.events = {};
  }

  emit<E extends SdkEvent>(event: E, data: SdkEventEnvelope<SdkEventData<E>>) {
    if (this.events[event]) {
      this.events[event].forEach(fn => {
        return fn(data);
      });
    }

    return this;
  }

  on<E extends SdkEvent>(event: E, fn: Cbfn<E>) {
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }

    return this;
  }

  off<E extends SdkEvent>(event: E, fn: Cbfn<E>) {
    if (event && typeof fn === 'function' && this.events[event]) {
      const listeners = this.events[event];
      if (!listeners || listeners.length === 0) {
        return;
      }
      const index = listeners.findIndex(_fn => {
        return _fn === fn;
      });
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    return this;
  }
}

export default Emitter;
