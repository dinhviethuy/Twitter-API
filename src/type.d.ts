export { };
declare global {
  interface URLSearchParams {
    get(key: 'access_token'): string | null;
    get(key: 'refresh_token'): string | null;
    get(key: 'new_user'): string | null;
  }
}
