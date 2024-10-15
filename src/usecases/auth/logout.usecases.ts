export class LogoutUseCases {
  constructor() {}

  async execute(): Promise<string[]> {
    return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0'];
  }
}
