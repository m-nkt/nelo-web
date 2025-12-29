# Update .env File for Nelo Domain

## Required Update

Please update your `.env` file with the following:

```env
BASE_URL=https://nelo.so
```

## Google Cloud Console Update

Update the **OAuth 2.0 Redirect URI** in Google Cloud Console to:

```
https://nelo.so/api/calendar/callback
```

## Steps:

1. Open your `.env` file
2. Find or add the `BASE_URL` line
3. Set it to: `BASE_URL=https://nelo.so`
4. Save the file
5. Update Google Cloud Console redirect URI
6. Restart your server

## Verification

After updating, you can verify the setup by:
- Visiting `https://nelo.so` - should show "Nelo is active!"
- Visiting `https://nelo.so/health` - should show JSON status

