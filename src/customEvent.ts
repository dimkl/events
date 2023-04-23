export interface IEvent {
  type: string
  data?: any
}
export class CustomEvent<TData = any> implements IEvent {
  readonly data?: TData;
  readonly type: string;

  constructor(type: string, options?: { data: TData }) {
    const { data } = options || {};
    this.type = type;
    this.data = data;
  }
}
