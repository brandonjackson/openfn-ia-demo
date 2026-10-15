/** Adaptors and their documented operations. Types only: no data, no behaviour. */

export interface Adaptor {
  id: string;
  name: string;
  description: string;
  category: string;
}

/** One operation in the Docs panel's "Adaptor API" list. */
export interface AdaptorFunction {
  name: string;
  params: string[];
  description: string;
  example?: string;
}
