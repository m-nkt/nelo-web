# Update .env File for Nelo Domain

Please update your `.env` file with the following:

```env
BASE_URL=https://nelo.so
```

This will ensure all Google Calendar OAuth callbacks and links use the correct domain.

## Important: Google Cloud Console

Don't forget to update the **Redirect URI** in Google Cloud Console to:
```
https://nelo.so/api/calendar/callback
```

## Steps:

1. Open your `.env` file
2. Find or add the `BASE_URL` line
3. Set it to: `BASE_URL=https://nelo.so`
4. Save the file
5. Restart your server

