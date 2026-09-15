import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      niveau?: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    niveau?: string;
  }
}
