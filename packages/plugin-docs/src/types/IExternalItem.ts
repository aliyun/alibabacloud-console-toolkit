export type IExternalItem =
  | string
  | {
    moduleName: string;
    usePathInDev?: string;
  };
