export class CustomEvent<TData = any> extends Event {
  data: TData;

  constructor(type: string, options?: any) {
    const { data, ...opts } = options || {};
    super(type, opts);
    this.data = data;
  }
}
