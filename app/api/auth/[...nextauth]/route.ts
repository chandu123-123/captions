import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnection } from "@/app/lib/database"; // Ensure this exports a function to connect to MongoDB
import { UserLogin } from "@/app/lib/model"; // Ensure this exports the Mongoose model
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Define the NextAuth options with type safety
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }): Promise<boolean> {
      await dbConnection(); // Connect to MongoDB

      // Check if the user exists in the database
      const existingUser = await UserLogin.findOne({ email: user.email });

      if (!existingUser) {
        // Create a new user if not found
        await UserLogin.create({
          email: user.email,
        });
      }

      return true; // Return true to proceed with sign-in
    },
    async redirect({ url, baseUrl }): Promise<string> {
      // Ensure redirect URLs start with the base URL
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }): Promise<Session> {
      // Add custom properties to the session
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
        };
      }
      return session;
    },
    async jwt({ token, user }): Promise<JWT> {
      // Add user ID to the token on first sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

// Export handler for GET and POST requests
export { handler as GET, handler as POST };
