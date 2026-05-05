export type AgentResponse = {
  result: string;
  error?: string;
};

export type QueryHandler = (query: string) => Promise<string>;
