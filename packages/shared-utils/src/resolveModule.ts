export function resolveModule(module: any) {
  if (module.__esModule) {
    return module.default;
  }
  return module;
}