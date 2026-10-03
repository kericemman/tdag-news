# Local editorial dashboard access

1. Add a non-production MongoDB Atlas connection string to the untracked root `.env` file as `MONGODB_URI=...`. The staff CLI loads this file automatically. The database must be reachable from this computer and allow its current IP address.
2. From `/Users/user/Desktop/tdag-news`, run:

   ```sh
   npm run staff:create -- --email=admin@news.thedigitalagame.com --name='Emmanuel Kerich' --role=super_admin
   ```

3. Enter a password of at least 12 characters at the hidden terminal prompt. It will not echo. Do not put the password in the command or `.env` file.
4. Start the app with `npm run dev`, then visit `http://localhost:3000/newsroom/sign-in` and sign in with that email and password. The editorial dashboard is at `/newsroom`.

Only one `super_admin` can exist. If an owner account is already present, this command refuses to create another. Do not run it against the production database by accident. A connection failure usually means the URI, Atlas network access list, or database user permissions need checking. Staff account creation uses MongoDB; Redis is needed for the collector worker, not for the initial sign-in.
